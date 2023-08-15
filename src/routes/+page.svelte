<script>
	import '../app.css';
	import { Room, createLocalTracks, RoomEvent } from 'livekit-client';

	const BASE_URL = import.meta.env.VITE_BASE_URL;
	const WS_URL = import.meta.env.VITE_WS_URL;

	let room;
	let visible = false;

	let user = {
		username: '',
		roomname: ''
	};

	const form = (e) => {
		user[e.target.name] = e.target.value;
	};

	const getToken = async (username, roomname) => {
		const response = await fetch(`${BASE_URL}/api/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: username,
				roomname: roomname
			})
		});

		const data = await response.json();
		console.log(data);
		return data;
	};

	const joinRoom = async () => {
		if (user.username.length < 1) {
			alert('username cannot be empty');
			return;
		} else if(user.roomname.length < 1) {
      alert('roomname cannot be empty');
      return;
    } 

		try {
			const generate = await getToken(user.username, user.roomname);

			const token = generate.token;
			const url = WS_URL;

			room = await new Room();
			await room.connect(url, token);
			console.log('connected to room', room.name);

			room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
				console.log('Participant Subscribed');
				attachTrack(track, participant);
			});

			const tracks = await createLocalTracks({
				audio: true,
				video: true
			});

			for (let track of tracks) {
				await room.localParticipant.publishTrack(track);

				console.log('Publishing Track');
				console.log(track);
				if (track.kind === 'video') {
					const v = document.getElementById('us');
					track.attach(v);
				}
			}

			visible = !visible;
		} catch (error) {
			console.log('error when connect to livekit ', error);
		}
	};

	const attachTrack = (track, _) => {
		const v = document.getElementById('them');
		track.attach(v);
	};

	const disconnect = async () => {
		await room.disconnect();
		visible = !visible;
	};
</script>

<div class="flex justify-center">
	<div class="rounded-md border-2 w-[500px] p-5 text-center mt-5">
		<h1 class="text-3xl font-semibold">Simple Video Call<br />with<br />Svelte + Livekit</h1>
		<div class="mt-5">
			{#if !visible}
				<div class="gap-2">
					<div class="flex flex-col justify-start mb-3">
						<label class="flex justify-start font-semibold text-lg" for="username">Username</label>
						<input
							class="p-2 border-2 rounded-md"
							id="username"
							name="username"
							type="text"
							placeholder="username"
							on:input={form}
						/>
					</div>

					<div class="flex flex-col justify-start">
						<label class="flex justify-start font-semibold text-lg" for="roomname">Room Name</label>
						<input
							class="p-2 border-2 rounded-md"
							id="roomname"
							name="roomname"
							type="text"
							placeholder="room name"
							on:input={form}
						/>
					</div>
					<button class="bg-blue-400 rounded-md p-3 mt-3 font-semibold" on:click={joinRoom}
						>Join Room</button
					>
				</div>
			{/if}

			{#if visible}
				<div id="pe" class="flex flex-col">
					<div class="flex flex-col mb-3">
						<video id="us" controls autoplay class="w-100">
							<track kind="captions" label="English captions" src="" srclang="en" default />
						</video>
						<p class="text-center font-semibold">You</p>
					</div>

					<div class="flex flex-col">
						<video id="them" controls autoplay class="w-100">
							<track kind="captions" label="English captions" src="" srclang="en" default />
						</video>
						<p id="participant" class="text-center font-semibold" />
					</div>
					<div class="flex justify-center">
						<button class="mt-8 bg-red-600 p-2 w-14 rounded-md font-semibold" on:click={disconnect}>exit</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
