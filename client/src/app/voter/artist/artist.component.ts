import { Component, OnInit, Input } from '@angular/core';

import { ISubscription } from "rxjs/Subscription";

import { SpotifyService } from '../../core/spotify/spotify.service';

import { SpotifyArtist } from '../../core/models/shared/core/spotify-artist'

import { SpotifyRequest } from '../../core/models/shared/spotify/spotify-request';
import { SpotifyAlbumRequest } from '../../core/models/shared/spotify/spotify-album-request';
import { SpotifyAlbumResponse } from '../../core/models/shared/spotify/spotify-album-response';

@Component({
    selector: 'app-artist',
    templateUrl: './artist.component.html',
    styleUrls: ['../../about/about.component.scss']
})
export class ArtistComponent implements OnInit {

    @Input()
    artist: SpotifyArtist;
    private connection: ISubscription;
    private amFetchingAlbums: boolean = false;

    constructor(private spotifyService: SpotifyService) { }

    ngOnInit() {
        this.artist = SpotifyArtist.fromJSON(this.artist);
        let responseHook: string = SpotifyAlbumResponse.fetchAlbumResponseHook(SpotifyService.appPrefix, SpotifyService.servicePrefix);
        this.connection = this.spotifyService.listen(responseHook).subscribe(albumResult => {
            let albumResponse = SpotifyAlbumResponse.FromObject(albumResult);
            if (albumResponse.GetID() == this.artist.GetID()) {
                this.amFetchingAlbums = false;
                this.artist.albums = albumResponse.GetItems();
            }
        });
    }

    fetchAlbums() {
        this.amFetchingAlbums = true;
        let albumsRequest = new SpotifyAlbumRequest(this.artist.GetID());
        let spotifyRequest = new SpotifyRequest(SpotifyRequest.FETCH_ALBUMS, albumsRequest);
        this.spotifyService.talk(spotifyRequest);
    }

}