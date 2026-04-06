import mysql.connector
import ufc_scraper

# Database connection configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Walruzlord111',    # Update this to match your MySQL password!
    'database': 'ufc_project'
}

def connect_to_db():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to database: {err}")
        return None

def ensure_fighter_exists(cursor, fighter_name):
    """Checks if a fighter exists. If not, adds them to the database."""
    cursor.execute("SELECT fighter_name FROM fighter WHERE fighter_name = %s", (fighter_name,))
    result = cursor.fetchone()
    
    if not result:
        print(f"Adding new fighter profile for: {fighter_name}")
        insert_query = """
            INSERT INTO fighter (fighter_name, wins, losses, draws, style) 
            VALUES (%s, NULL, NULL, NULL, NULL)
        """
        cursor.execute(insert_query, (fighter_name,))
        return True
    return False

def check_fight_exists(cursor, fighterA, fighterB, event):
    """Checks if a specific fight already exists in the database."""
    query = """
        SELECT fight_id FROM fight 
        WHERE ((fighter1 = %s AND fighter2 = %s) OR (fighter1 = %s AND fighter2 = %s))
        AND fight_card = %s
    """
    cursor.execute(query, (fighterA, fighterB, fighterB, fighterA, event))
    result = cursor.fetchone()
    return result[0] if result else None

def process_fight_data():
    conn = connect_to_db()
    if not conn:
        return
    
    cursor = conn.cursor()

    print("Initializing Scraper...")
    history = ufc_scraper.startScript()
    
    if not history:
        print("No history found or scraper failed.")
        return

    primary_fighter = input("Confirm the name of the fighter you just scraped for DB insertion: ")

    ensure_fighter_exists(cursor, primary_fighter)
    conn.commit()

    new_fights_added = 0
    for fight_data in history:
        if not fight_data or len(fight_data) == 0:
            continue
        
        gen_stats = fight_data[0]
        fighterA, fighterB, event, winner, method, end_rd = gen_stats
        
        existing_fight_id = check_fight_exists(cursor, fighterA, fighterB, event)
        
        if existing_fight_id:
            print(f"Fight already exists: {fighterA} vs {fighterB} at {event}. Skipping...")
            continue
            
        print(f"New fight found: {fighterA} vs {fighterB}. Adding to database...")
        
        ensure_fighter_exists(cursor, fighterA)
        ensure_fighter_exists(cursor, fighterB)
        
        insert_fight_query = """
            INSERT INTO fight (fighter1, fighter2, fight_card, winner, method, end_round)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_fight_query, (fighterA, fighterB, event, winner, method, end_rd))
        
        new_fight_id = cursor.lastrowid
        
        # 4. Insert Stats (Reverted to the original 8-chunk parsing logic)
        # 4. Insert Stats 
        if len(fight_data) >= 3:
            totals_table = fight_data[1]
            sig_table = fight_data[2]
            
            fighterA_tot = totals_table[0] if len(totals_table) > 0 else []
            fighterB_tot = totals_table[1] if len(totals_table) > 1 else []
            fighterA_sig = sig_table[0] if len(sig_table) > 0 else []
            fighterB_sig = sig_table[1] if len(sig_table) > 1 else []
            
            num_rows = len(fighterA_tot) // 8
            
            def safe_int(val):
                try: return int(val)
                except ValueError: return 0

            for r in range(num_rows):
                # This fixes the graph bug! Separates the 'Overall' row from the '1', '2', '3' rounds
                rd_label = "Overall" if r == 0 else str(r)
                
                start_idx = r * 8
                end_idx = start_idx + 8
                
                for is_fighterA in [True, False]:
                    if is_fighterA:
                        f_name = fighterA
                        opp_name = fighterB
                        tot_chunk = fighterA_tot[start_idx:end_idx]
                        sig_chunk = fighterA_sig[start_idx:end_idx] if len(fighterA_sig) >= end_idx else []
                    else:
                        f_name = fighterB
                        opp_name = fighterA
                        tot_chunk = fighterB_tot[start_idx:end_idx]
                        sig_chunk = fighterB_sig[start_idx:end_idx] if len(fighterB_sig) >= end_idx else []
                        
                    if len(tot_chunk) == 8:
                        kd = safe_int(tot_chunk[1])
                        sig_str = tot_chunk[2]
                        tot_str = tot_chunk[3]
                        td = tot_chunk[4]
                        sub = safe_int(tot_chunk[5])
                        rev = safe_int(tot_chunk[6])
                        ctrl = tot_chunk[7]
                        
                        if len(sig_chunk) == 8:
                            head = sig_chunk[2]
                            body = sig_chunk[3]
                            leg = sig_chunk[4]
                            dist = sig_chunk[5]
                            clinch = sig_chunk[6]
                            ground = sig_chunk[7]
                        else:
                            head = body = leg = dist = clinch = ground = "0/0"
                            
                        insert_stats_query = """
                            INSERT INTO stats (fight_id, fighter, opponent, rd, kd, sig_str, total_str, td, sub, rev, ctrl, head_str, body_str, leg_str, distance_str, clinch_str, ground_str)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """
                        cursor.execute(insert_stats_query, (
                            new_fight_id, f_name, opp_name, rd_label, 
                            kd, sig_str, tot_str, td, sub, rev, ctrl, 
                            head, body, leg, dist, clinch, ground
                        ))
            
        new_fights_added += 1

    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"\nDatabase update complete! Added {new_fights_added} new fight(s).")

if __name__ == "__main__":
    process_fight_data()