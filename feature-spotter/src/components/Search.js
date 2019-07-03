import React, { Component } from "react";

// Search component for each artist
class Search extends Component {
  render() {
    // State changes on every key down
    return (
      <div className="search">
        <input
          placeholder="Search For An Artist..."
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

export default Search;
