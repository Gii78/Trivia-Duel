TRIVIA DUEL — 2–5 players

1. Extract this whole folder from the ZIP.
2. Double-click Start-TriviaDuel.cmd on the Windows host computer.
   Node.js 22+ is required; the launcher also finds the bundled runtime on this computer.
3. Keep the game window open. If Windows Firewall asks, allow private network access.
4. Open http://localhost:8080 on the host. Create a room using your nickname.
5. The game window prints a phone address such as http://192.168.1.20:8080.
   Every phone must use that address and connect to the same Wi-Fi as the host.
   Do not use localhost on the phones; that points to the phone itself.
6. Share the six-character room code. Players choose Join a room and enter it.
7. The host starts once 2–5 players are present.

RULES
10 mixed-category questions. Each opens after a brief synchronized countdown.
20 seconds to submit one locked answer. Answers remain hidden until everyone
answers or time expires. Correct: 100 points + up to 50 for speed; wrong/missed: 0.
The server calculates time and score. Results stay visible for six seconds.
Highest total wins. Tied leaders play sudden death: the highest score earned
in the tiebreaker question wins; another tie triggers another question.
Other players can keep answering but cannot win the tiebreaker.
Host can rematch. Questions avoid those already seen while at least 10 remain
in the 50-question bank; after that the bank is reshuffled.

NOTES
Room state updates about every 0.6 seconds across connected devices.
Keep the browser foregrounded during play. Refreshing the same tab reconnects.
Inactive rooms expire after four hours. Restarting the server clears all rooms.
An absent player receives zero for missed questions. Leave is available in the
lobby and on final results; leaving host transfers hosting to the next player.
The launcher runs on a local network. For long-distance play, see ONLINE-HOSTING.txt.
The online hosting configuration is included; public deployment is still required.
Guest Wi-Fi or router client isolation can prevent phones from reaching the host.
If needed, permit inbound TCP port 8080 on your private network in Windows Firewall.
Use an HTTPS hosting service for public play; do not use router port forwarding.

Developer checks: node --test test.mjs
Manual server start: node server.mjs
Optional port: set PORT before starting the server.
