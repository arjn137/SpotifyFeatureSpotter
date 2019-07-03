import React, { Component } from "react";

// List of songs with artist "featured"
class List extends Component {
  // NEED TO DELAY everything after album.songs because it's not loading
  render() {
    let setSongs = [];
    let songValues = [];
    this.props.appearsArray.forEach(song => {
      if (!songValues.includes(song.name)) {
        songValues.push(song.name);
        setSongs.push(song);
      }
    });

    return (
      <div className="list">
        <h4>
          {this.props.artist} is featured on {setSongs.length} songs
        </h4>
        <ul>
          {setSongs.map(song => {
            let artists = song.artists.map(item => {
              return item.name;
            });
            return (
              <li>
                <h5>{song.name + " - " + artists.join(", ")}</h5>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default List;
