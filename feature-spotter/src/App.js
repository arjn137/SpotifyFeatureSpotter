import React, { Component } from "react";
import "./App.css";
//quick update

// Mock formatted data used before accessing Spotify API
let fakeServerData = {
  user: {
    name: "Arjun"
  },
  artist: {
    name: "J. Cole",
    appearsOn: [
      {
        name: "i am > i was",
        songs: [
          {
            name: "all my friends",
            artists: ["21 Savage", "Post Malone"]
          },
          {
            name: "a lot",
            artists: ["21 Savage", "J. Cole"]
          },
          {
            name: "good day",
            artists: ["21 Savage", "Schoolboy Q"]
          }
        ]
      },
      {
        name: "Oxnard",
        songs: [
          {
            name: "Trippy",
            artists: ["Anderson .Paak", "J. Cole"]
          },
          {
            name: "Tints",
            artists: ["Anderson .Paak", "Kendrick Lamar"]
          },
          {
            Name: "Left to Right",
            artists: ["Anderson .Paak"]
          }
        ]
      },
      {
        name: "DiCaprio 2",
        songs: [
          {
            Name: "Just Another Day",
            artists: ["J.I.D"]
          },
          {
            songName: "Tiiied",
            artists: ["J.I.D", "6lack", "Ella Mai"]
          },
          {
            Name: "Off Deez",
            artists: ["J.I.D", "J. Cole"]
          }
        ]
      }
    ]
  }
};

// Search component for each artist
class Search extends Component {
  render() {
    // State changes on every key down
    return (
      <div className="search">
        Search for Artist
        <input
          type="text"
          onKeyDown={event => {
            if (event.key === "Enter") {
              this.props.onChange(event.target.value);
            }
          }}
        />
      </div>
    );
  }
}

// List of songs with artist "featured"
class List extends Component {
  render() {
    // Gets all feature songs from appearsOn albums

    let records = this.props.appearsArray.map(album => {
      let filteredTracks = album.songs.filter(song => {
        return song.artists.includes(this.props.artist.name);
      });
      return filteredTracks;
    });

    let setSongs = [];
    let songValues = [];
    for (var i = records.length - 1; i >= 0; i--) {
      // Eliminates any cases where there are no songs
      if (records[i].length === 0) {
        records.splice(i, 1);
      }
      // Adds songs to setSongs to eliminate duplicates
      else if (!songValues.includes(records[i][0].name)) {
        setSongs.push(records[i]);
        songValues.push(records[i][0].name);
      }
    }

    return (
      <div className="list">
        <ol>
          {setSongs.map(song => (
            <li>{song[0].name + " - " + song[0].artists.join(", ")}</li>
          ))}
        </ol>
      </div>
    );
  }
}

// Displays number of albums the artist appears on
class AppearsCounter extends Component {
  render() {
    return (
      <div className="appearsCounter">
        {this.props.appearsArray && this.props.artist && (
          <h4>
            {" "}
            {this.props.artist.name} appears on {this.props.appearsArray.length}{" "}
            albums
          </h4>
        )}
      </div>
    );
  }
}

// Button that automatically adds songs to a Spotify Playlist (not implemented yet)
class AddToPlayList extends Component {
  render() {
    return <div className="addtoplaylist">AddToPlayListButton</div>;
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      serverData: {
        user: "",
        artist: {
          name: "",
          appearsOn: []
        }
      },
      filterString: ""
    };
  }

  getUserInfo(accessToken) {
    return new Promise((resolve, reject) => {
      fetch("https://api.spotify.com/v1/me/", {
        headers: {
          Authorization: "Bearer " + accessToken
        }
      })
        .then(res => res.json())
        .then(data => {
          resolve(data.display_name);
        });
    });
  }

  performSearch(query, accessToken) {
    let artistName = "";
    let artistID = "";
    var p = new Promise((resolve, reject) => {
      var adjustedArtistName = query.replace(" ", "%20");
      console.log(adjustedArtistName);
      // Get Artist from Search
      fetch(
        `https://api.spotify.com/v1/search?q=${adjustedArtistName}&type=artist`,
        {
          headers: {
            Authorization: "Bearer " + accessToken
          }
        }
      )
        .then(res => res.json())
        .then(data => {
          resolve(data.artists.items[0].id);
        });
    });

    p.then(ID => {
      artistID = ID;
      this.getArtistInfo(artistID, accessToken).then(name => {
        artistName = name;
        this.getAppearsOn(artistID, accessToken, artistName, query);
      });
    });
  }

  getArtistInfo(artistID, accessToken) {
    return new Promise((resolve, reject) => {
      fetch(`https://api.spotify.com/v1/artists/${artistID}/`, {
        headers: {
          Authorization: "Bearer " + accessToken
        }
      })
        .then(res => res.json())
        .then(data => {
          resolve(data.name);
        });
    });
  }

  getAppearsOn(artistID, accessToken, artistName, query) {
    fetch(
      `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=appears_on`,
      {
        headers: {
          Authorization: "Bearer " + accessToken
        }
      }
    )
      .then(res => res.json())
      .then(data => {
        // create array with all albums artist appears on (songs and name)
        var appears = data.items.map(album => {
          var albumData = {};
          albumData.name = album.name;
          albumData.songs = [];
          // Go through into each album that the artist appears on and get track list
          fetch(`https://api.spotify.com/v1/albums/${album.id}/tracks`, {
            headers: {
              Authorization: "Bearer " + accessToken
            }
          })
            .then(res => res.json())
            .then(d => {
              let songsArray = [];
              //get artists and song names from each track (returns object and each doesn't need to specifically include artist)
              d.items.forEach(elem => {
                var temp = {};
                var artists = [];
                var songName = elem.name;
                elem.artists.forEach(e => {
                  artists.push(e.name);
                });
                temp.artists = artists;
                temp.name = songName;
                songsArray.push(temp);
              });
              albumData.songs = songsArray;
            });
          return albumData;
        });

        // set the final state with user name, artist name, and appears on album array
        this.setState({
          filterString: query,
          serverData: Object.assign({}, this.state.serverData, {
            artist: {
              name: artistName,
              appearsOn: appears
            }
          })
        });
      });
  }

  onSearchHandler(query) {
    let parsed = /access_token=(\S+)/.exec(window.location.search);
    let accessToken = parsed[1];
    if (!accessToken) return;
    this.performSearch(query, accessToken);
  }

  componentDidMount() {
    // Recieve access token from verified user
    let parsed = /access_token=(\S+)/.exec(window.location.search);
    let accessToken = parsed[1];
    if (!accessToken) return;

    this.getUserInfo(accessToken).then(user => {
      this.setState({
        serverData: Object.assign({}, this.state.serverData, { user: user })
      });
    });
  }

  render() {
    return (
      <div className="App">
        <h1>Feature Spotter</h1>
        {this.state.serverData.user ? (
          <div>
            <h2>{this.state.serverData.user}'s Spotify</h2>

            <Search onChange={this.onSearchHandler.bind(this)} />
            {/**onTextChange={text => this.setState({ filterString: text })} */}
            {this.state.serverData.artist &&
              this.state.filterString !== "" &&
              this.state.serverData.artist.name
                .toLowerCase()
                .includes(this.state.filterString.toLowerCase()) && (
                <AppearsCounter
                  appearsArray={this.state.serverData.artist.appearsOn}
                  artist={this.state.serverData.artist}
                />
              )}

            {this.state.serverData.artist.appearsOn &&
              this.state.filterString !== "" &&
              this.state.serverData.artist.name
                .toLowerCase()
                .includes(this.state.filterString.toLowerCase()) && (
                <List
                  appearsArray={this.state.serverData.artist.appearsOn}
                  artist={this.state.serverData.artist}
                />
              )}

            {/*<AddToPlayList />*/}
          </div>
        ) : (
          <button
            onClick={() => (window.location = "http://localhost:8888/login")}
          >
            Sign In With Spotify
          </button>
        )}
      </div>
    );
  }
}

export default App;
