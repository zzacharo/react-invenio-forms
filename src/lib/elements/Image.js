// This file is part of InvenioRDM
// Copyright (C) 2022 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import PropTypes from "prop-types";
import React, { Component } from "react";
import { Image as SUIImage, Item, Ref } from "semantic-ui-react";
import axios from "axios";

/**
 * Primary UI Image component providing a fallback url if src one is not
 * able to be resolved. This is a thin layer on top of the <img> element.
 */
export class Image extends Component {
  async componentDidMount() {
    const { loadFallbackFirst, src } = this.props;
    if (loadFallbackFirst) {
      try {
        await axios.get(src);
        this.setSrc(this.myRef.current, src);
      } catch (error) {
        // Fallback image is already loaded
      }
    }
  }
  myRef = React.createRef();

  setSrc = (currentTarget, src) => {
    const { asItem } = this.props;
    if (asItem) {
      // Item.Image is wrapping the <img> in a div element
      currentTarget.childNodes[0].src = src;
    } else {
      currentTarget.src = src;
    }
  };

  render() {
    const { alt, className, src, fallbackSrc, loadFallbackFirst, asItem, ...UIprops } =
      this.props;
    const ImageCmp = asItem ? Item.Image : SUIImage;
    const loadingClass = loadFallbackFirst ? `${className} placeholder` : className;
    const url = loadFallbackFirst ? fallbackSrc : src;
    return (
      <Ref innerRef={this.myRef}>
        <ImageCmp
          className={loadingClass}
          alt={alt}
          src={url}
          {...(!loadFallbackFirst && {
            onError: ({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              this.setSrc(currentTarget, fallbackSrc);
            },
            onLoad: () => {
              // Control the loader via ref to make it immediately invisible
              if (!loadFallbackFirst) {
                this.myRef.current.classList.remove("placeholder");
              }
            },
          })}
          {...UIprops}
        />
      </Ref>
    );
  }
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  fallbackSrc: PropTypes.string,
  className: PropTypes.string,
  alt: PropTypes.string,
  asItem: PropTypes.bool,
  loadFallbackFirst: PropTypes.bool,
};

Image.defaultProps = {
  className: "",
  alt: "No image found",
  fallbackSrc: "/static/images/square-placeholder.png",
  asItem: false,
  loadFallbackFirst: false,
};
