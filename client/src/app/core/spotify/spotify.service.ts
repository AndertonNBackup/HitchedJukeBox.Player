import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { SocketService } from '../socket/socket.service'

import { SpotifyRequest } from '../models/shared/spotify/spotify-request';
import { SpotifySearchResponse } from '../models/shared/spotify/spotify-search-response';

@Injectable()
export class SpotifyService {

    public static appPrefix: string = "HJB";
    public static servicePrefix: string = 'Spotify';

    constructor(private socket: SocketService) {

    }

    talk(spotifyRequest: SpotifyRequest):void {
        let searchHook = SpotifyRequest.fetchCommandHook(SpotifyService.appPrefix, SpotifyService.servicePrefix);
        this.socket.sendMessage(searchHook, spotifyRequest);
    }

    listen(responseHook: string): Observable<any> {
        return this.socket.getMessages(responseHook);
    };

}