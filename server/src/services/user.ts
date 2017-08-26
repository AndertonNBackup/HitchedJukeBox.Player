let connectedUserMap = new Map<string, any>();
export class UserFunctions {

    private static UserMap = connectedUserMap;

    public static getMap(): Map<string, any> {
        return UserFunctions.UserMap;
    }

    public static getUser(socketID: string): { status: string, name: string } {
        return UserFunctions.UserMap.get(socketID);
    }

    public static getSocketIdForUserName(userName: string): string {
        let socketID: string = '';
        UserFunctions.UserMap.forEach((user: any, key: string, map: Map<string, any>) => {
            if(user.name === userName) {
                socketID = key;
            }
        });
        return socketID;
    }

    public static getOnlineUserCount(): number {
        let onlineUsers: number = 0;
        UserFunctions.UserMap.forEach((user: any, key: string, map: Map<string, any>) => {
            if(user.status === 'online') {
                onlineUsers++;
            }
        });
        return onlineUsers;
    }

}