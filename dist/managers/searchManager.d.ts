import { Music, Playlist, Home } from "../models/";
import { TypeSearch_param } from '../types/TypeSearch';
/**
 * Search music, video or other with query
 * @param query Query to search
 * @param type Type of search
 */
export declare function search(query: string, type: TypeSearch_param): Promise<Array<Music>>;
export declare function getHomePage(): Promise<Home>;
export declare function relative(ID: string): Promise<Array<Music>>;
export declare function get(id: string): Promise<Music>;
export declare function getPlaylist(id: string): Promise<Playlist>;
export declare function GetData(id: string): Promise<any>;
//# sourceMappingURL=searchManager.d.ts.map