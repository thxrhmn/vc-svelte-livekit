import { AccessToken } from 'livekit-server-sdk';

const API_KEY = import.meta.env.VITE_API_KEY
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY

export async function POST(requestEvent){
  const { request } = requestEvent
  const data = await request.json()

  const createToken = () => {
    const roomName = data.roomname;
    const participantName = data.username;

    const at = new AccessToken(API_KEY, SECRET_KEY, {
      identity: participantName,
    });
    at.addGrant({ roomJoin: true, room: roomName, canSubscribe: true, canPublish: true});

    const datas = {
      roomname: roomName,
      username: participantName,
      token: at.toJwt()
    }
    console.log(datas)

    return datas
  }

  return Response.json(createToken())
}