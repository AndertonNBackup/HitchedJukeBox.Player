import { Component, OnInit, Input } from '@angular/core';

import { NowPlayingService } from '../../core/now-playing/now-playing.service';

import { NowPlayingRequest } from '../../core/models/shared/now-playing/now-playing-request';
import { NowPlayingTrackRequest } from '../../core/models/shared/now-playing/now-playing-track-request';

@Component({
    selector: 'app-track',
    templateUrl: './track.component.html',
    styleUrls: ['../../about/about.component.scss']
})
export class TrackComponent implements OnInit {

    @Input()
    track: Object;

    constructor(private nowPlayingService: NowPlayingService) 
    { 
        this.nowPlayingService = nowPlayingService;
    }

    ngOnInit() {

    }

    request() {

        let trackRequest = new NowPlayingTrackRequest(this.track);
        let nowPlayingRequest = new NowPlayingRequest(NowPlayingRequest.NP_REQUEST_TRACK, trackRequest);
        this.nowPlayingService.talk(nowPlayingRequest);

    }

}