import React, { Fragment } from 'react';
import { VideoI } from '../interfaces/video';
import VideoCard from './VideoCard';
import ChannelCard from './ChannelCard';

const Video: React.FC<VideoI> = ({ videos, direction }) => {
  return (
    <Fragment>
      <div className={`ks-video-grid ${direction === 'column' ? 'column-layout' : ''}`}>
        {videos.map((item: any, idx: number) => (
          <div key={idx} style={{ width: '100%' }}>
            {item.id?.videoId && <VideoCard video={item} />}
            {item.id?.channelId && <ChannelCard channelDetail={item} />}
          </div>
        ))}
      </div>
    </Fragment>
  );
};

export default Video;
