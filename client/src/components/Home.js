import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both the field is requried");
      return;
    }

    // redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
    toast.success("room is created");
  };

  // when enter then also join
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="container-fluid">
      <div className="particles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>
      <div className="content-wrapper">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-12 col-md-6">
            <div className="card shadow-lg p-2 mb-5 rounded glow" style={{
              background: 'rgba(26, 35, 126, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(218, 165, 32, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(13, 71, 161, 0.37)'
            }}>
              <div className="card-body text-center">
                <img
                  src="/images/codecast.png"
                  alt="Logo"
                  className="img-fluid mx-auto d-block mb-4"
                  style={{ 
                    maxWidth: "150px",
                    filter: 'drop-shadow(0 0 10px rgba(218, 165, 32, 0.3))',
                    transition: 'transform 0.3s ease',
                    ':hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
                <h4 className="card-title text-light mb-4" style={{
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}>Enter the ROOM ID</h4>

                <div className="form-group">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="form-control mb-3"
                    placeholder="ROOM ID"
                    onKeyUp={handleInputEnter}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(218, 165, 32, 0.3)',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      '::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)'
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-control mb-4"
                    placeholder="USERNAME"
                    onKeyUp={handleInputEnter}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(218, 165, 32, 0.3)',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      '::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)'
                      }
                    }}
                  />
                </div>
                <button
                  onClick={joinRoom}
                  className="btn btn-lg btn-block mb-4"
                  style={{
                    background: 'linear-gradient(45deg, #daa520, #b8860b)',
                    border: 'none',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(218, 165, 32, 0.3)',
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  }}
                >
                  JOIN
                </button>
                <p className="mt-3 text-light">
                  Don't have a room ID? create{" "}
                  <span
                    onClick={generateRoomId}
                    className="p-2"
                    style={{ 
                      cursor: "pointer",
                      transition: 'all 0.3s ease',
                      color: '#daa520',
                      textDecoration: 'underline',
                      textDecorationColor: 'rgba(218, 165, 32, 0.3)',
                      ':hover': {
                        textShadow: '0 0 10px rgba(218, 165, 32, 0.5)',
                        textDecorationColor: '#daa520'
                      }
                    }}
                  >
                    New Room
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
