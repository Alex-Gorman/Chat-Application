import React from 'react';
import { useParams, Link } from 'react-router-dom';

function ChannelPage() {
  const { channelId } = useParams();

  return (
    <div>
      <h2>Channel Details</h2>
      <p>Channel ID: {channelId}</p>
      {/* Add more details or fetch data for the specific channel */}
      <Link to="/channels">Go Back</Link>
      <h3>Chat Room: [Chat Room Name Here]</h3>
    </div>
  );
}

export default ChannelPage;






