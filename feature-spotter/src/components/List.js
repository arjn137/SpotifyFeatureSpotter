import React, { Component } from "react";
import sim from "string-similarity";

// List of songs with artist "featured"
class List extends Component {
  playPreview = e => {
    var audio = e.target.previousSibling;
    var image = e.target;

    if (audio) {
      if (audio.paused) {
        audio.play();
        image.src = require("../assets/revplaybutton.png");
      } else {
        audio.pause();
        image.src = require("../assets/playbutton.png");
      }
    }
  };

  render() {
    let setSongs = [];
    let songValues = [];
    this.props.appearsArray.forEach(song => {
      var doesExist = false;
      for (var i = 0; i < songValues.length; i++)
        if (
          sim.compareTwoStrings(
            song.name.replace(/[-|(].*/, ""),
            songValues[i]
          ) > 0.9
        )
          doesExist = true;

      if (!doesExist) {
        songValues.push(song.name.replace(/[-|(].*/, ""));
        setSongs.push(song);
      }
    });

    return (
      <div className="list">
        <h3 id="num-of-tracks">{setSongs.length} tracks</h3>
        <ul>
          {setSongs.map(song => {
            let artists = song.artists.map(item => {
              return item.name;
            });

            return (
              <li>
                <div className="song-player">
                  <button id="play-button">
                    <audio>
                      <source src={song.preview_url} type="audio/mpeg" />
                    </audio>

                    <img
                      id="play-image"
                      src={require("../assets/playbutton.png")}
                      onClick={this.playPreview}
                      style={{ verticalAlign: "middle" }}
                      width="30"
                      height="30"
                    />
                  </button>

                  <a
                    id="song-name"
                    href={song.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {song.name + " - " + artists.join(", ")}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default List;
