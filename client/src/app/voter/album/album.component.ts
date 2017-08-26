import { Component, OnInit, Input } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";

import { SpotifyService } from '../../core/spotify/spotify.service';
import { NowPlayingService } from '../../core/now-playing/now-playing.service';

import { SpotifyAlbum } from '../../core/models/shared/core/spotify-album'

import { SpotifyRequest } from '../../core/models/shared/spotify/spotify-request';
import { SpotifyTrackRequest } from '../../core/models/shared/spotify/spotify-track-request';
import { SpotifyTrackResponse } from '../../core/models/shared/spotify/spotify-track-response';

import { NowPlayingRequest } from '../../core/models/shared/now-playing/now-playing-request';
import { NowPlayingAlbumRequest } from '../../core/models/shared/now-playing/now-playing-album-request';

@Component({
    selector: 'app-album',
    templateUrl: './album.component.html',
    styleUrls: ['../../about/about.component.scss']
})
export class AlbumComponent implements OnInit {

    @Input()
    album: SpotifyAlbum;
    private connection: ISubscription;
    private amFetchingTracks: boolean = false;

    constructor(private spotifyService: SpotifyService, private nowPlayingService: NowPlayingService) { }

    ngOnInit() {
        this.album = SpotifyAlbum.fromJSON(this.album);
        let responseHook: string = SpotifyTrackResponse.fetchTrackResponseHook(SpotifyService.appPrefix, SpotifyService.servicePrefix);
        this.connection = this.spotifyService.listen(responseHook).subscribe(trackResult => {
            let trackResponse = SpotifyTrackResponse.FromObject(trackResult);
            if (trackResponse.GetID() == this.album.GetID()) {
                this.amFetchingTracks = false;
                this.album.tracks = trackResponse.GetItems();
            }
        });
    }

    fetchTracks() {
        this.amFetchingTracks = true;
        let tracksRequest = new SpotifyTrackRequest(this.album.GetID());
        let spotifyRequest = new SpotifyRequest(SpotifyRequest.FETCH_TRACKS, tracksRequest);
        this.spotifyService.talk(spotifyRequest);
    }

    request() {

        let albumRequest = new NowPlayingAlbumRequest(this.album);
        let nowPlayingRequest = new NowPlayingRequest(NowPlayingRequest.NP_REQUEST_ALBUM, albumRequest);
        this.nowPlayingService.talk(nowPlayingRequest);

    }

}