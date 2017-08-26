import { Component, OnInit, OnDestroy } from '@angular/core';

import { environment } from '../../../../../environments/environment';

import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from "rxjs/Subscription";

import { SpotifyService } from '../../../../core/spotify/spotify.service';
import { SpotifySearchResponse } from '../../../../core/models/shared/spotify/spotify-search-response';

@Component({
    selector: 'hjbv-results',
    templateUrl: './results-view.component.html',
    styleUrls: ['./results-view.component.scss']
})
export class ResultsViewComponent implements OnInit, OnDestroy {

    private searchResults: SpotifySearchResponse;
    private connection: ISubscription;

    constructor(private spotifyService: SpotifyService) {

    }

    ngOnInit() {

        let responseHook: string = SpotifySearchResponse.fetchSearchResponseHook(SpotifyService.appPrefix, SpotifyService.servicePrefix);
        this.connection = this.spotifyService.listen(responseHook).subscribe(searchResult => {
            this.searchResults = SpotifySearchResponse.FromObject(searchResult);
        });

    }

    ngOnDestroy() {

        this.connection.unsubscribe();

    }
}
