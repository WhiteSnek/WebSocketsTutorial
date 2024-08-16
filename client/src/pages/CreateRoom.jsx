import React, { useState, useEffect } from 'react';
// import { socket } from "../sockets/socket";
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Box, CircularProgress, Typography } from '@mui/material';
import { useSocket } from '../providers/SocketProvider';

const CreateRoom = () => {
  const { socket } = useSocket()
  const [loading, setLoading] = useState({ creating: false, joining: false });
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      socket.off('create-room');
      socket.off('join-room');
    };
  }, []);

  const createRoom = async () => {
    setLoading({ ...loading, creating: true });
    socket.emit('create-room', { name: userName }, (response) => {
      setLoading({ ...loading, creating: false });
      if (response && response.success) {
        console.log(`Room created: ${response.room}`);
        navigate(`/room/${response.room}`);
      } else {
        console.error(response.error || 'Room creation failed');
      }
      setLoading({...loading, creating: false})
    });
  };

  const joinRoom = async () => {
    if (!roomName) {
      console.error('Room name is required');
      return;
    }

    setLoading({ ...loading, joining: true });
    socket.emit('join-room', { room: roomName, name: userName }, (response) => {
      setLoading({ ...loading, joining: false });
      if (response && response.success) {
        navigate(`/room/${response.room}`);
      } else {
        console.error(response.error || 'Failed to join room');
      }
      setLoading({...loading, joining: false})
    });
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ display: 'grid', gap: 2, backgroundColor: '#1F2937', p: 4, borderRadius: 2 }}>
        <Typography variant='h4' sx={{color: 'white', fontWeight: '800'}}>Join or Create a Room</Typography>
        <TextField
          variant="outlined"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          fullWidth
          sx={{ backgroundColor: '#374151', color: 'white', input: { color: 'white' } }}
        />
        <Button
          onClick={createRoom}
          variant="contained"
          color="primary"
          disabled={loading.creating}
          fullWidth
          sx={{ backgroundColor: '#111827', color: 'white' }}
        >
          {loading.creating ? <CircularProgress size={24} color="inherit" /> : 'Create Room'}
        </Button>
        <TextField
          variant="outlined"
          placeholder="Enter room name to join"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          fullWidth
          sx={{ backgroundColor: '#374151', color: 'white', input: { color: 'white' } }}
        />
        <Button
          onClick={joinRoom}
          variant="contained"
          color="primary"
          disabled={loading.joining}
          fullWidth
          sx={{ backgroundColor: '#111827', color: 'white' }}
        >
          {loading.joining ? <CircularProgress size={24} color="inherit" /> : 'Join Room'}
        </Button>
      </Box>
    </Container>
  );
};

export default CreateRoom;
