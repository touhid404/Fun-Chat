import React from 'react';
import NewsFeed from './pages/Home/NewsFeed';
import SocketStatus from './pages/Home/SocketStatus';

const App = () => {
  return (
    <div className='flex min-h-screen justify-center items-center'>
    {/* <NewsFeed/> */}
    <SocketStatus/>
      
    </div>
  );
};

export default App;