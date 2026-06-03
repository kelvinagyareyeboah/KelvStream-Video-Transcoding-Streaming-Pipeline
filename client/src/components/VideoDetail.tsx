import React, { useState, useEffect, Fragment } from 'react';
import ReactPlayer from 'react-player';
import { Link, useParams } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

import { VideoDetailI } from '../interfaces/video';
import Video from './Video';
import { fetchFromAPI } from '../utils/fetchFromAPI';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const VideoDetail: React.FC = () => {
  const [videoDetail, setVideoDetail] = useState<VideoDetailI | null>(null);
  const [videos, setVideos] = useState([]);
  const [transcodingStatus, setTranscodingStatus] = useState<'processing' | 'completed' | 'failed' | null>(null);

  const { id } = useParams();
  const isLocal = id && id.includes('-');

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isLocal) {
      const checkStatus = () => {
        fetch(`${BACKEND_URL}/status/${id}`)
          .then((res) => res.json())
          .then((data) => {
            setTranscodingStatus(data.status);
            setVideoDetail({
              snippet: {
                title: data.title,
                channelId: 'local-pipeline',
                channelTitle: 'Local Systems Pipeline',
              },
              statistics: { viewCount: '0', likeCount: '0' },
            });
            if (data.status === 'completed' || data.status === 'failed') {
              clearInterval(intervalId);
            }
          })
          .catch(() => {
            setTranscodingStatus('failed');
            clearInterval(intervalId);
          });
      };

      checkStatus();
      intervalId = setInterval(checkStatus, 3000);

      fetchFromAPI(`search?part=snippet&q=programming`).then((data) =>
        setVideos(data.items)
      );
    } else {
      setTranscodingStatus(null);
      fetchFromAPI(`videos?part=snippet,statistics&id=${id}`).then((data) =>
        setVideoDetail(data.items[0])
      );
      fetchFromAPI(`search?part=snippet&relatedToVideoId=${id}&type=video`).then(
        (data) => setVideos(data.items)
      );
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id, isLocal]);

  const title = videoDetail?.snippet?.title;
  const channelId = videoDetail?.snippet?.channelId;
  const channelTitle = videoDetail?.snippet?.channelTitle;
  const viewCount = videoDetail?.statistics?.viewCount;
  const likeCount = videoDetail?.statistics?.likeCount;

  return (
    <Fragment>
      <div className='ks-detail-container'>
        {/* Player Column */}
        <div className='ks-player-column'>

          {/* Processing State */}
          {isLocal && transcodingStatus === 'processing' && (
            <div className='ks-pipeline-box'>
              <div style={{ fontSize: '2.5rem' }}>⚙️</div>
              <p style={{ color: 'var(--ks-purple-glow)', fontWeight: 700, fontSize: '1.1rem' }}>
                FFmpeg Pipeline Active
              </p>
              <p style={{ color: 'var(--ks-text-secondary)', fontSize: '0.9rem' }}>
                Transcoding to Adaptive Bitrate HLS chunks...
              </p>
              <p style={{ color: 'var(--ks-text-muted)', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                Generating: stream_0 (360p) + stream_1 (720p) → master.m3u8
              </p>
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className='ks-pipeline-pulse'
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Failed State */}
          {isLocal && transcodingStatus === 'failed' && (
            <div className='ks-pipeline-box' style={{ borderColor: '#ef4444' }}>
              <div style={{ fontSize: '2.5rem' }}>⚠️</div>
              <p style={{ color: '#ef4444', fontWeight: 700 }}>Transcoding Pipeline Failed</p>
              <p style={{ color: 'var(--ks-text-muted)', fontSize: '0.85rem' }}>
                FFmpeg could not process the source file. Ensure FFmpeg is installed and in your system PATH.
              </p>
            </div>
          )}

          {/* Video Player */}
          {(!isLocal || transcodingStatus === 'completed') && (
            <div className='ks-player-sticky-wrapper'>
              <div className='ks-player-wrapper'>
                <ReactPlayer
                  url={
                    isLocal
                      ? `${BACKEND_URL}/streams/${id}/master.m3u8`
                      : `https://www.youtube.com/watch?v=${id}`
                  }
                  width='100%'
                  height='100%'
                  controls
                  style={{ display: 'block' }}
                />
              </div>

              {/* Video Meta */}
              <div className='ks-video-meta'>
                <h1 className='ks-video-title'>{title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
                  <Link
                    to={isLocal ? '#' : `/channel/${channelId}`}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span style={{ color: 'var(--ks-purple-glow)', fontWeight: 600, fontSize: '0.9rem' }}>
                      {channelTitle}
                    </span>
                    <CheckCircleIcon style={{ fontSize: 15, color: 'var(--ks-purple-glow)' }} />
                  </Link>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span className='ks-stat-pill'>
                      <VisibilityIcon style={{ fontSize: 13, marginRight: 4 }} />
                      {viewCount ? parseInt(viewCount).toLocaleString() : 0} views
                    </span>
                    <span className='ks-stat-pill'>
                      <ThumbUpIcon style={{ fontSize: 13, marginRight: 4 }} />
                      {likeCount ? parseInt(likeCount).toLocaleString() : 0} likes
                    </span>
                    {isLocal && (
                      <span className='ks-stat-pill' style={{ color: 'var(--ks-purple-glow)', borderColor: 'var(--ks-purple-primary)' }}>
                        ⚡ Local HLS Stream
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Videos Column */}
        <div className='ks-related-column'>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ks-text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Up Next
          </p>
          <Video videos={videos} direction='column' />
        </div>
      </div>
    </Fragment>
  );
};

export default VideoDetail;
