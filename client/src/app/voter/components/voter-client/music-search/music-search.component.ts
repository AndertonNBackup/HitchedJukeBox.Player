import { Component, OnInit, OnDestroy } from '@angular/core';

import { environment } from '../../../../../environments/environment';

import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from "rxjs/Subscription";

import { SpotifyService } from '../../../../core/spotify/spotify.service';

import { SpotifyRequest } from '../../../../core/models/shared/spotify/spotify-request';
import { SpotifySearchRequest } from '../../../../core/models/shared/spotify/spotify-search-request';

@Component({
    selector: 'hjbv-search',
    templateUrl: './music-search.component.html',
    styleUrls: ['./music-search.component.scss']
})
export class MusicSearchComponent implements OnInit {

    public message: string;

    public searchType: { id: number; name: string };
    public searchTypes: Array<any> = [
        { id: 0, name: "Song" },
        { id: 1, name: "Album" },
        { id: 2, name: "Artist" }
    ];

    constructor(private spotifyService: SpotifyService) {

        this.searchType = this.searchTypes[0];

    }

    ngOnInit() {

    }

    search() {

        let searchRequest = new SpotifySearchRequest(this.searchType, this.message);
        let spotifyRequest = new SpotifyRequest(SpotifyRequest.SEARCH, searchRequest);
        this.spotifyService.talk(spotifyRequest);
        this.message = '';
        
    }

}
