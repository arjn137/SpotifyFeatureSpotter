import React, { Component } from "react";
import "./App.css";
import List from "./components/List";
import Search from "./components/Search";
import AddToPlayList from "./components/AddToPlayList";

class App extends Component {
  state = {
    serverData: {
      user: "",
      artist: {
        name: "",
        featuredSongs: []
      }
    },
    filterString: ""
  };

  componentDidMount() {
    // Recieve access token from verified user
    let parsed = /access_token=(\S+)/.exec(window.location.search);
    let accessToken = parsed[1];
    if (!accessToken) return;

    this.getUserInfo(accessToken).then(user => {
      let serverData = { ...this.state.serverData };
      serverData.user = user;
      this.setState({ serverData });
    });
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
    // var p = new Promise((resolve, reject) => {
    var adjustedArtistName = query.replace(" ", "%20");
    // console.log(adjustedArtistName);
    // Get Artist from Search
    fetch(
      `https://api.spotify.com/v1/search?q=${adjustedArtistName}&type=artist&limit=50`,
      {
        headers: {
          Authorization: "Bearer " + accessToken
        }
      }
    )
      .then(res => res.json())
      .then(data => {
        return data.artists.items[0].id;
      })
      .then(ID => {
        artistID = ID;
        return this.getArtistInfo(artistID, accessToken);
      })
      .then(name => {
        artistName = name;
        return this.getAppearsOn(artistID, accessToken, artistName, query);
      })
      .then(arrayOfAlbums => {
        let songs = [];
        setTimeout(() => {
          arrayOfAlbums.forEach(album => {
            album.items.forEach(song => {
              song.artists.forEach(artist => {
                if (artist.name === artistName && song.artists.length > 1) {
                  songs.push(song);
                }
              });
            });
          });
          this.setState({
            filterString: query,
            serverData: Object.assign({}, this.state.serverData, {
              artist: {
                name: artistName,
                featuredSongs: songs
              }
            })
          });
        }, 800);
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
    return new Promise((resolve, reject) => {
      let totalCovers = [];
      const numOfResults = 8;
      for (var i = 0; i < numOfResults; i++) {
        fetch(
          `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=appears_on&limit=50&offset=${i *
            50}`,
          {
            headers: { Authorization: "Bearer " + accessToken }
          }
        )
          .then(res => res.json())
          .then(data => {
            data.items.forEach(item => {
              totalCovers.push(item);
            });
          });
      }
      setTimeout(() => {
        // create array with all albums artist appears on (songs and name)
        Promise.all(
          totalCovers.map(album => {
            return fetch(
              `https://api.spotify.com/v1/albums/${album.id}/tracks?limit=50`,
              {
                headers: {
                  Authorization: "Bearer " + accessToken
                }
              }
            );
          })
        ).then(responses => {
          Promise.all(
            responses.map(res => {
              return res.json();
            })
          ).then(results => {
            console.log(results);
            resolve(results);
          });
        });
      }, 500);
    });
  }

  onSearchHandler(query) {
    let parsed = /access_token=(\S+)/.exec(window.location.search);
    let accessToken = parsed[1];
    if (!accessToken) return;
    this.performSearch(query, accessToken);
  }

  render() {
    return (
      <div className="App">
        <img
          src={require("./assets/Spotify_Icon_RGB_Green.png")}
          height="150"
          width="150"
        />
        <h1>Feature Spotter</h1>
        {this.state.serverData.user ? (
          <div>
            {/*<div>
              <h2>{this.state.serverData.user}'s Spotify</h2>
            </div>*/}
            <Search onChange={this.onSearchHandler.bind(this)} />

            {this.state.serverData.artist.featuredSongs &&
              this.state.filterString !== "" &&
              this.state.serverData.artist.name
                .toLowerCase()
                .includes(this.state.filterString.toLowerCase()) && (
                <List
                  appearsArray={this.state.serverData.artist.featuredSongs}
                  artist={this.state.serverData.artist.name}
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
