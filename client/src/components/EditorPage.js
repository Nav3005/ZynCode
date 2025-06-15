import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

// Boilerplate code for different languages
const languageBoilerplates = {
  python3: "print(\"Hello World !!\")",
  java: `public class jdoodle {
    public static void main(String[] args) {
        System.out.println("Hello World !!");
    }
}`,
  cpp: `#include <iostream>
  int main() {
    std::cout << "Hello World !!" << std::endl;
    return 0;
}`,
  nodejs: "console.log(\"Hello World !!\");",
  c: `#include <stdio.h>

int main() {
    printf("Hello World !!");
    return 0;
}`,
  ruby: "puts \"Hello World !!\"",
  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello World !!")
}`,
  scala: "println(\"Hello World !!\")",
  bash: "echo \"Hello World !!\"",
  sql: "SELECT 'Hello World !!';",
  pascal: `program HelloWorld;
begin
    writeln('Hello World !!');
end.`,
  csharp: `using System;

class Program {
    static void Main(String[] args) {
        Console.WriteLine("Hello World !!");
    }
}`,
  php: "<?php echo \"Hello World !!\"; ?>",
  swift: "print(\"Hello World !!\")",
  rust: `fn main() {
    println!(\"Hello World !!\");
}`,
  r: "print(\"Hello World !!\")",
};

// List of supported languages
const LANGUAGES = Object.keys(languageBoilerplates);

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const codeRef = useRef(null);

  const Location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const socketRef = useRef(null);

  // Set initial code based on selected language
  useEffect(() => {
    if (codeRef.current === null) {
      codeRef.current = languageBoilerplates[selectedLanguage];
    }
  }, [selectedLanguage]);

  useEffect(() => {
    const handleErrors = (err) => {
      console.log("Error", err);
      toast.error("Socket connection failed, Try again later");
      navigate("/");
    };

    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: Location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== Location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          // Sync code for newly joined client, prioritizing existing code if available
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current || languageBoilerplates[selectedLanguage],
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();

    return () => {
      socketRef.current && socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  if (!Location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID is copied`);
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the room ID");
    }
  };

  const leaveRoom = async () => {
    navigate("/");
  };

  const runCode = async () => {
    setIsCompiling(true);
    try {
      const response = await axios.post("http://localhost:8080/compile", {
        code: codeRef.current,
        language: selectedLanguage,
      });
      console.log("Backend response:", response.data);
      if (typeof response.data === 'string') {
        try {
          const parsedData = JSON.parse(response.data);
          if (parsedData.error || parsedData.statusCode !== 200) {
            // If there's an error or non-200 status, show full parsed data for debugging
            setOutput(JSON.stringify(parsedData, null, 2));
          } else if (parsedData.output) {
            setOutput(parsedData.output);
          } else {
            setOutput(response.data); // Fallback to raw if no specific fields
          }
        } catch (parseError) {
          setOutput(response.data); // Not JSON, display as is
        }
      } else if (response.data.error || response.data.statusCode !== 200) {
        // If there's an error or non-200 status, show full data for debugging
        setOutput(JSON.stringify(response.data, null, 2));
      } else if (response.data.output) {
        setOutput(response.data.output);
      } else {
        setOutput(JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      console.error("Error compiling code:", error);
      // For compilation errors, show as much detail as possible
      const errorMessage = error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message;
      setOutput(`Compilation Error: ${errorMessage || "An unknown error occurred"}`);
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleCompileWindow = () => {
    setIsCompileWindowOpen(!isCompileWindowOpen);
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column" style={{
      background: '#000000',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px 0 rgba(13, 71, 161, 0.37)'
    }}>
      <div className="row flex-grow-1">
        {/* Client panel */}
        <div className="col-md-2 text-light d-flex flex-column" style={{
          background: '#000000',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(218, 165, 32, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(13, 71, 161, 0.37)',
          padding: '1.5rem'
        }}>
          <img
            src="/images/zyncode.png"
            alt="Logo"
            className="img-fluid mx-auto mb-4"
            style={{ 
              maxWidth: "150px",
              filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.3))',
              transition: 'transform 0.3s ease',
              ':hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
          <hr style={{ borderTop: '1px solid rgba(218, 165, 32, 0.3)' }} />

          {/* Client list container */}
          <div className="d-flex flex-column flex-grow-1 overflow-auto" style={{
            background: '#000000',
            backdropFilter: 'blur(10px)',
          }}>
            <span className="mb-2" style={{ fontWeight: 'bold', color: '#daa520' }}>Members</span>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>

          <hr style={{ borderTop: '1px solid rgba(218, 165, 32, 0.3)' }} />
          {/* Buttons */}
          <div className="mt-auto mb-3">
            <button className="btn w-100 mb-2" onClick={copyRoomId}
              style={{
                background: '#daa520',
                border: 'none',
                color: 'white',
                boxShadow: '0 4px 15px rgba(218, 165, 32, 0.3)',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
            >
              Copy Room ID
            </button>
            <button className="btn w-100" onClick={leaveRoom}
              style={{
                background: '#1a237e',
                border: 'none',
                color: 'white',
                boxShadow: '0 4px 15px rgba(26, 35, 126, 0.3)',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
            >
              Leave Room
            </button>
          </div>
        </div>

        {/* Editor panel */}
        <div className="col-md-10 text-light d-flex flex-column" style={{
          background: '#000000',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(13, 71, 161, 0.37)'
        }}>
          {/* Language selector */}
          <div className="p-2 d-flex justify-content-end" style={{
            background: '#000000',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(218, 165, 32, 0.3)',
            boxShadow: '0 4px 15px rgba(13, 71, 161, 0.37)'
          }}>
            <select
              className="form-select w-auto" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(218, 165, 32, 0.3)',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
            initialCode={languageBoilerplates[selectedLanguage]}
          />
        </div>
      </div>

      {/* Compiler toggle button */}
      <button
        className="btn position-fixed bottom-0 end-0 m-3"
        onClick={toggleCompileWindow}
        style={{
          zIndex: 1050,
          background: '#daa520',
          border: 'none',
          color: 'white',
          boxShadow: '0 4px 15px rgba(218, 165, 32, 0.3)',
          fontWeight: 'bold',
          letterSpacing: '1px'
        }}
      >
        {isCompileWindowOpen ? "Close Compiler" : "Open Compiler"}
      </button>

      {/* Compiler section */}
      <div
        className={`text-light p-3 ${
          isCompileWindowOpen ? "d-block" : "d-none"
        }`}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: isCompileWindowOpen ? "30vh" : "0",
          transition: "height 0.3s ease-in-out",
          overflowY: "auto",
          zIndex: 1040,
          background: '#000000',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(218, 165, 32, 0.3)',
          boxShadow: '0 -8px 32px 0 rgba(13, 71, 161, 0.37)',
          padding: '1.5rem'
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0" style={{ fontWeight: 'bold', color: '#daa520' }}>Compiler Output ({selectedLanguage})</h5>
          <div>
            <button
              className="btn me-2"
              onClick={runCode}
              disabled={isCompiling}
              style={{
                background: '#daa520',
                border: 'none',
                color: 'white',
                boxShadow: '0 4px 15px rgba(218, 165, 32, 0.3)',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
            >
              {isCompiling ? "Compiling..." : "Run Code"}
            </button>
            <button className="btn" onClick={toggleCompileWindow}
              style={{
                background: '#1a237e',
                border: 'none',
                color: 'white',
                boxShadow: '0 4px 15px rgba(26, 35, 126, 0.3)',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
            >
              Close
            </button>
          </div>
        </div>
        <pre className="p-3 rounded" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(218, 165, 32, 0.3)',
          color: 'white',
          fontWeight: 'bold',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {output || "Output will appear here after compilation"}
        </pre>
      </div>
    </div>
  );
}

export default EditorPage;
