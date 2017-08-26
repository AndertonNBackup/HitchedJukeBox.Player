export class VoterResponse {
    type: object;
    items: Array<any>;
    booleans: Array<boolean>;
    limit: number;
    offset: number;
    total: number;

    public static fromJSON(json: any): VoterResponse {
        return JSON.parse(JSON.stringify(json)) as VoterResponse;
    }
}