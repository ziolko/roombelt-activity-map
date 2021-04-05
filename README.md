# Roombelt activity map 🗺

<img src="https://maps.roombelt.com/roombelt.svg" height="300">

This application generates an animated SVG world map with locations of active users of Roombelt. The map is embedded into https://roombelt.com in the "social proof" section to prove that the product has real world usage. 

You can easily create similar map for your product by following the steps below.

### Prerequisites
1. Star this repository 😜
2. Create a [Vercel account](https://vercel.com/dashboard).
3. Get a Redis instance. I use [Upstash](https://www.upstash.com/) but any modern Redis server would do.

### Installation
1. Create a new Vercel project with the following environment variables:
   * `REDIS_URL`, `REDIS_PASSWORD` and `REDIS_PORT` that define connection to the Redis database.
   * `TOKEN` is a secret that you will use to report users' activity to the map.
2. Clone this repository.
3. Deploy this repository to Vercel with Vercel CLI or git.

### Usage 
Single server can serve multiple separate maps. I use only https://maps.roombelt.com/roombelt.svg but other addresses like https://maps.roombelt.com/example.svg or https://maps.roombelt.com/subscribers.svg could be used as well. 

The map contains up to 100 locations of clients active in the last 30 minutes. To change the limits modify [this line](https://github.com/ziolko/roombelt-activity-map/blob/main/api/%5Bname%5D.ts#L70).

Reporting user activity from your back-end is as simple as sending a `POST` request with a valid authorization header and the reported `ip` address in the payload. This is how I do it in the Roombelt backend:
```js
await axios.post(
  "https://maps.roombelt.com/roombelt.svg",
  { ip: clientIp },
  { headers: { Authorization: `Bearer ${process.env["TOKEN"]}` } }
);
```

### Credits
The idea was inspired by [Clever Cloud](https://www.clever-cloud.com/en/) dashboard activity map. The map generation code is based on https://github.com/NTag/dotted-map.

### Jobs
I am looking for teammates in [my daily job](https://marketplace.atlassian.com/apps/1223211/whiteboards-for-jira-team-collaboration). If you're really strong in React and live in CEST +/- 3h let me know at mateusz.zielinski@spartez-software.com.

### License
[Apache 2.0](https://github.com/ziolko/roombelt-activity-map/blob/main/LICENSE)

If you use the activity map on your site let me know at mateusz@roombelt.com and I will add a link here.
