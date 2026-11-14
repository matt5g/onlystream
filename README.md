<h1>OnlyStream</h1>
<h2>Gives you one working stream link instead of one out of a hundred</h2>
<p>OnlyStream is a Stremio addon that currently only works with AIOStreams, but I'll add support for other addons in a future update.</p>
<h2>How It Works</h2>
<p>OnlyStream is a middleman between Stremio and AIOStreams that receives stream results from AIOStreams, then sorts, probes, and ranks them. Streams are sorted based on the displayed number of torrent peers first, then probes a certain configurable number of highest-peer streams with WebTorrent to establish an actual peer count, as AIOStreams sometimes returns outdated or incorrect source data. If none of the highest-peer streams according to AIO have 1 peer or more when probed, the addon can failback on a configurable number of additional streams from the pre-ranked list. This addon also has semi-configurable probing profiles to account for differences in P2P availability throughout the day, currently supporting two shift profiles from midnight to 8am and 9am to midnight, the former of which being more aggressive by default in the case that fewer people are streaming and seeding the torrents during those hours. Each stream result is also checked against a persistent blacklist which can be added to by using the report stream button that appears under the actual result in the source selection pane. This works by spoofing an episode as a video named report-broken.mkv, which then requests subtitles from the addon and triggers the addition of the last attempted stream's info hash to the blacklist. After all the filtering steps, the addon returns just one stream result that in testing usually works, and if all of that fails, you can always report it broken and the source will be blocked by its info hash (which is convenient because many torrents hold entire series or seasons of them).</p>
<h1>Installation Instructions</h1>
<p>Download repository as zip and open a new terminal in OnlyStream directory. Run commands:</p>
<pre><code>npm install
node server.js
</code></pre>
<h1>Configuration</h1>
<p>Many of the things configurable here are also probably configurable in AIOStreams or whatever scraping addons this may support in the future, but are also added here for convenience sake.</p>
<table>
  <thead>
    <tr>
      <th>Config</th>
      <th>Default</th>
      <th>Info</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>allowedResolutions</code></td><td><code>["1080p", "720p", "480p"]</code></td><td>Resolutions not on this list (such as 4k if you are bandwidth-limited) will be excluded from the ranked results</td></tr>
    <tr><td><code>includeHTTPStreams</code></td><td><code>false</code></td><td>Most commonly used scrapers don't even get HTTP results but in case they do, disabling them can help with quality control, and honestly the system of how these are treated needs to be reworked</td></tr>
    <tr><td><code>peerLimit</code></td><td><code>500</code></td><td>In testing, streams with peers in the high hundreds or thousands were usually links that had been taken down and no longer worked</td></tr>
    <tr><td><code>minPeers</code></td><td><code>3</code></td><td>Minimum count to be considered as a stream result, can be tuned for better performance.</td></tr>
    <tr><td><code>addonUrls</code></td><td><i>Empty Array</i></td><td>Put your AIOStreams manifest URL here</td></tr>
    
  </tbody>
</table>
<p>Graphical config in browser coming soon!</p>
<h1>Planned Features</h1>
<ul>
  <li>Support for torrentio, mediafusion, and comet</li>
  <li>Config webpage</li>
  <li>Move all probe-related settings to probe-profiles and put more useful settings in normal config</li>
  <li>convert to a decodable secret in the manifest url rather than writing config to disk</li>
  <li>Blacklist tiers and expirations</li>
</ul>
<p>If you have any suggestions or find bugs, feel free to contact me, open a new issue, or even fix it yourself. This project is 100% open source :)</p>
