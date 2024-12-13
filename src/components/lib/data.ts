import { supabase } from "./supabase";

// export async function matchPlayers(match: string) {
//   return await supabase
//     .from<IPlayerMatch>("player_match")
//     .select("*,player!player_match_player_id_fkey(id,full_name,team_id)")
//     .eq("match", match);
// }

// export async function events(match: string) {
//   const data = await supabase
//     .from<Events>("events")
//     .select("*")
//     .eq("match_id", match);
// }