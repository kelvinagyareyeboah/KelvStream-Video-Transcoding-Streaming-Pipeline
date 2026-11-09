"manifest":"/transcoded/vid_1718000000000/master.m3u8"
}
```

### `GET /transcoded/:id/master.m3u8`

Returns the HLS master manifest for the given video ID.

```m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p.m3u8
```

---

## Contributing

```bash
# Fork → clone → branch
git checkout -b feat/your-feature

# Make changes, then
git commit -m "feat: describe your change"
git push origin feat/your-feature
# Open a Pull Request
```

---

## License

MIT — see [`LICENSE`](./LICENSE) for details.

---

<div align="center">

Built with precision. Streamed with purpose.

**KelvStream** · FAANG-Grade Streaming Infrastructure

</div>
