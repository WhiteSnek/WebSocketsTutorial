import React, { useState, useEffect, useCallback } from "react";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  IconButton,
  createTheme,
  ThemeProvider,
  Snackbar
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../providers/SocketProvider";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      paper: "#1c1c1c",
    },
    text: {
      primary: "#ffffff",
    },
  },
});

const ChatBox = ({ endCall, setUsername }) => {
  const { roomId } = useParams()
  const { socket } = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const [chats, setChats] = useState([]);
  const [value, setValue] = useState("");
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const onConnect = () => {
    setIsConnected(true);
  };

  const onDisconnect = () => {
    setIsConnected(false);
  };

  const onChatMessage = ({ name, msg }) => {
    setChats((prev) => [...prev, { name, message: msg }]);
  };

  const onRoomLeft = ({ name }) => {
    setSnackbarMsg(`${name} left the room`);
    setOpen(true);
  };

  const setName = (name) => {
    console.log(name);
    setUsername(name);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const notifyRoomJoin = ({ room, name }) => {
    setSnackbarMsg(`${name} joined the room`);
    setOpen(true);
  };

  useEffect(() => {
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat message", onChatMessage);
    socket.on("user-left", onRoomLeft);
    socket.on("room-joined", notifyRoomJoin);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat message", onChatMessage);
      socket.off("user-left", onRoomLeft);
      socket.off("room-joined", notifyRoomJoin);
    };
  }, [onConnect, onDisconnect, onChatMessage, onRoomLeft, setName, notifyRoomJoin]);

  const onSubmit = (event) => {
    event.preventDefault();
    if (value.trim()) {
      socket.emit("chat message", value);
      setValue(""); // Clear the input box
    }
  };

  useEffect(() => {
    if (endCall) {
      socket.disconnect();
      navigate("/");
    }
  }, [endCall, navigate, socket]);

  return (
    <ThemeProvider theme={darkTheme}>
      <Paper
        sx={{
          bgcolor: "background.paper",
          p: 2,
          borderRadius: 2,
          color: "text.primary",
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Room: {roomId}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", height: "80vh" }}>
          <List sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}>
            {chats.map((chat, index) => (
              <ListItem
                key={index}
                sx={{ bgcolor: "grey.700", my: 1, borderRadius: 1 }}
              >
                <ListItemText
                  primary={chat.name}
                  secondary={chat.message}
                  primaryTypographyProps={{
                    fontWeight: "bold",
                    fontSize: "small",
                    color: "grey.300",
                  }}
                  secondaryTypographyProps={{
                    fontSize: "large",
                    color: "white",
                  }}
                />
              </ListItem>
            ))}
          </List>
          <Box
            component="form"
            onSubmit={onSubmit}
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "grey.800",
              p: 1,
              borderRadius: 1,
            }}
          >
            <TextField
              value={value}
              onChange={(e) => setValue(e.target.value)}
              variant="outlined"
              fullWidth
              placeholder="Type a message"
              sx={{
                mr: 2,
                "& .MuiOutlinedInput-root": {
                  color: "text.primary",
                  bgcolor: "grey.900",
                  "& fieldset": {
                    borderColor: "grey.700",
                  },
                  "&:hover fieldset": {
                    borderColor: "grey.500",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />
            <IconButton type="submit" color="primary">
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
      <Snackbar
        sx={{
          bgcolor: darkTheme.palette.background.paper,
          color: darkTheme.palette.text.primary,
          '& .MuiSnackbarContent-root': {
            backgroundColor: darkTheme.palette.background.paper,
            color: darkTheme.palette.text.primary,
          },
          '& .MuiSnackbarContent-message': {
            color: darkTheme.palette.text.primary,
          },
        }}
        open={open}
        autoHideDuration={10000}
        onClose={handleClose}
        message={snackbarMsg}
      />
    </ThemeProvider>
  );
};

export default ChatBox;
