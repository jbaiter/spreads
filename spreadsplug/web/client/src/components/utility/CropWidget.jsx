/*
 * Spreads - Modular workflow assistant for book digitization
 * Copyright (C) 2013-2015 Johannes Baiter <johannes.baiter@gmail.com>
 *
 * This file is part of Spreads.
 *
 * Spreads is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * Spreads is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Spreads.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, {PropTypes} from "react";

import ResponsiveMixin from "components/utility/ResponsiveMixin";

// TODO: Rendering the image into a canvas is *really* slow on mobile browsers.
//       Consider using the DOM for rendering the image and only drawing the
//       rectangle using the canvas.

// Border length of border hitboxes
const HITBOX_LENGTH = 35;
// Minimum border length of crop box in either dimension
const MINIMUM_LENGTH = 15;
// Color and alpha of the crop box
const CROPBOX_COLOR = "rgba(255,0,0,0.5)";

export default React.createClass({
  displayName: "CropWidget",
  mixins: [ResponsiveMixin],
  propTypes: {
    /** Source image URL */
    imageSrc: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
    /** Function that is called when the user decides to save the crop
      * selection */
    onSave: PropTypes.func.isRequired,
    /** Current crop parameters, for unscaled image */
    initialCropParams: PropTypes.object,
    /** Whether to show input boxes with values below image */
    showInputs: PropTypes.bool
  },

  // =============== Lifecycle methods ==================
  getDefaultProps() {
    return {
      showInputs: false,
      cropParams: null,
      container: () => this.refs.cropContainer
    };
  },

  getInitialState() {
    return {
      /** Position of last touch, has properties `x` and `y` */
      lastTouch: null,
      cursorStyle: "default",
      /** Indicates the operation the dragging movement is supposed to cause.
       *  Takes the same values as `cursorStyle`, i.e. all `*-resize` and `move`
       *  values from the CSS `cursor` spec. */
      dragMode: null,
      /** The parameters for our cropping box, has properties `x`, `y`, `width`
       *  and `height`. */
      cropParams: this.props.initialCropParams,
      /** DOM node for full resolution source image, used to obtain data for
       *  the offscreen canvas. */
      sourceImage: this.loadImage(true),
      /** DOM node for the onscreen canvas */
      canvasNode: null,
      /** DOM node for the offscreen canvas */
      offscreenCanvasNode: null,
      /** Position of the canvas within the document, has properties `x` and `y` */
      canvasPosition: null,
      /** Whether `requestAnimationFrame()` was fired and has not triggered a redraw
       *  yet. */
      redrawPending: false
    };
  },

  componentDidMount() {
    document.addEventListener("mousemove", this.handleMovement);
    document.addEventListener("touchmove", this.handleMovement);
  },

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.handleMovement);
    document.removeEventListener("touchmove", this.handleMovement);
  },

  shouldComponentUpdate(nextProps, nextState) {
    return (nextState.dragMode !== this.state.dragMode) ||
           (nextState.size.width !== this.state.size.width) ||
           (nextState.size.height !== this.state.size.height) ||
           (nextState.cursorStyle !== this.state.cursorStyle);
  },

  // =============== Helper methods ==================
  /*
   * The naming of the modes follows the values for the CSS `cursor` property
   *
   *               +------+----------------------+------+
   *             { |  nw  |          n           |  ne  |
   *  cornerEdge { |resize|        resize        |resize|
   *               +------+----------------------+------+
   *               |  w   |                      |  e   |
   *               |resize|         move         |resize|
   *               |      |                      |      |
   *               +------+----------------------+------+
   *               |  sw  |          s           |  se  |
   *               |resize|        resize        |resize|
   *               +------+----------------------+------+
   *
   * Outside of current crop-box means "default" (= clear old and resize-se)
   */
  getDragMode({clientX, clientY}) {
    const {canvasPosition: canvas, cropParams: cropBox} = this.state;
    if (!cropBox) {
      return "default";
    }
    const offsetLeft   = clientX - canvas.x - cropBox.x,
          offsetTop    = clientY - canvas.y - cropBox.y,
          offsetRight  = cropBox.width - offsetLeft,
          offsetBottom = cropBox.height - offsetTop;
    const cornerEdge = HITBOX_LENGTH;

    if (offsetLeft < 0 || offsetTop < 0 || offsetRight < 0 || offsetBottom < 0) {
      return "default";
    } else if (offsetLeft < cornerEdge) {
      // Westside, yo
      if (offsetTop < cornerEdge) {
        return "nw-resize";
      } else if (offsetBottom < cornerEdge) {
        return "sw-resize";
      } else {
        return "w-resize";
      }
    } else if (offsetRight < cornerEdge) {
      // Eastside, yo
      if (offsetTop < cornerEdge) {
        return "ne-resize";
      } else if (offsetBottom < cornerEdge) {
        return "se-resize";
      } else {
        return "e-resize";
      }
    } else {
      if (offsetTop < cornerEdge) {
        return "n-resize";
      } else if (offsetBottom < cornerEdge) {
        return "s-resize";
      } else {
        return "move";
      }
    }
  },

  /** Scale image and draw to to off-screen canvas.
   *   his is a rather expensive operation, hence we use an offscreen canvas
   *  to only do it once for every resize and for the actual drawing to the
  *   onscreen canvas we can just copy the pixels from it. */
  renderImage() {
    const offCtx = this.state.offscreenCanvasNode.getContext("2d");
    offCtx.drawImage(this.state.sourceImage, 0, 0, this.state.size.width,
                     this.state.size.height);
  },

  /** Request a redraw of the on-screen canvas.
   *  The actual redrwaing is left to the renderer via `requestAnimationFrame`
   *  to ensure optimal performance.
   *  The actual drawing just means copying the pixels from the offscreen-canvas
   *  (which we painted to in `renderImage`) to the onscreen one. This avoids
   *  scaling the underlying image on every redraw, with also helps with
  *   performance. */
  requestRedraw() {
    if (!this.state.redrawPending) {
      requestAnimationFrame(this.redraw);
      this.setState({
        redrawPending: true
      });
    }
  },

  redraw() {
    const ctx = this.state.canvasNode.getContext("2d");
    ctx.drawImage(this.state.offscreenCanvasNode, 0, 0);
    if (this.state.cropParams) {
      const {x, y, width, height} = this.state.cropParams;
      ctx.fillStyle = CROPBOX_COLOR;
      ctx.strokeStyle = CROPBOX_COLOR;
      ctx.fillRect(x, y, width, height);

      ctx.beginPath();
      ctx.strokeStyle = "rgba(0,0,0,1.0)";
      ctx.setLineDash([5]);
      ctx.moveTo(x + HITBOX_LENGTH, y + HITBOX_LENGTH);
      ctx.lineTo(x + width - HITBOX_LENGTH, y + HITBOX_LENGTH);
      ctx.lineTo(x + width - HITBOX_LENGTH, y + height - HITBOX_LENGTH);
      ctx.lineTo(x + HITBOX_LENGTH, y + height - HITBOX_LENGTH);
      ctx.closePath();
      ctx.stroke();
    }
    this.setState({
      redrawPending: false
    });
  },

  loadImage(initial=false) {
    let src;
    if (typeof this.props.imageSrc === "function") {
      src = this.props.imageSrc(initial ? {width: 640} : this.state.size);
    } else {
      src = this.props.imageSrc;
    }
    if (!initial && window.location.origin + src === this.state.sourceImage.src) {
      return this.state.sourceImage;
    } else {
      console.log("load");
      let img = new Image();
      img.addEventListener("load", this.onImageLoaded);
      img.src = src;
      return img;
    }
  },

  /** Makes sure that the newly calculated crop box does not reach beyond
   *  the canvas area in any dimension. */
  sanitizeCropBox(cropBox) {
    const {dragMode} = this.state;
    if (cropBox.x < 0) {
      cropBox.x = 0;
    } else if (cropBox.x >= this.state.size.width) {
      cropBox.x = this.state.size.width - 15;
    }
    if (cropBox.x + cropBox.width > this.state.size.width) {
      if (dragMode === "move") {
        cropBox.x = this.state.size.width - cropBox.width;
      } else {
        cropBox.width = this.state.size.width - cropBox.x;
      }
    }
    if (cropBox.y < 0) {
      cropBox.y = 0;
    } else if (cropBox.y >= this.state.size.height) {
      cropBox.y = this.state.size.height - 15;
    }
    if (cropBox.y + cropBox.height > this.state.size.height) {
      if (dragMode === "move") {
        cropBox.y = this.state.size.height - cropBox.height;
      } else {
        cropBox.height = this.state.size.height - cropBox.y;
      }
    }
    return cropBox;
  },

  /** Updates the cropBox from the movement delta. */
  updateCropBox(movementX, movementY) {
    let {cropParams: cropBox, dragMode} = this.state;

    if (movementX === 0 && movementY === 0) {
      return;
    }

    const northAreas = ["nw-resize", "n-resize", "ne-resize"],
          eastAreas  = ["ne-resize", "e-resize", "se-resize"],
          southAreas = ["sw-resize", "s-resize", "se-resize"],
          westAreas  = ["nw-resize", "w-resize", "sw-resize"];
    if (["move"].concat(westAreas).indexOf(dragMode) !== -1) {
      cropBox.x += movementX;
    }
    if (["move"].concat(northAreas).indexOf(dragMode) !== -1) {
      cropBox.y += movementY;
    }
    if (eastAreas.indexOf(dragMode) !== -1) {
      cropBox.width = Math.max(MINIMUM_LENGTH, cropBox.width + movementX);
    } else if (westAreas.indexOf(dragMode) !== -1) {
      cropBox.width = Math.max(MINIMUM_LENGTH, cropBox.width - movementX);
    }
    if (southAreas.indexOf(dragMode) !== -1) {
      cropBox.height = Math.max(MINIMUM_LENGTH, cropBox.height + movementY);
    } else if (northAreas.indexOf(dragMode) !== -1) {
      cropBox.height = Math.max(MINIMUM_LENGTH, cropBox.height - movementY);
    }
    cropBox = this.sanitizeCropBox(cropBox);

    this.setState({
      cropParams: cropBox
    }, this.requestRedraw);
  },

  // Normalizes touch and mouse events to a common interface
  normalizeInputEvent(e) {
    e.preventDefault();
    let normalized = {};
    if (e instanceof MouseEvent || e.nativeEvent instanceof MouseEvent) {
      normalized.clientX = e.clientX;
      normalized.clientY = e.clientY;
      normalized.movementX = Math.floor(e.webkitMovementX || e.mozMovementX || e.movementX || 0);
      normalized.movementY = Math.floor(e.webkitMovementY || e.mozMovementY || e.movementY || 0);
    } else {
      let newLastTouch;
      if (e.type === "touchend") {
        newLastTouch = null;
      } else {
        const touch = e.touches[0];
        newLastTouch = {x: touch.clientX, y: touch.clientY};
        normalized.clientX = touch.clientX;
        normalized.clientY = touch.clientY;
        if (e.type === "touchmove") {
          normalized.movementX = Math.floor(touch.clientX - this.state.lastTouch.x);
          normalized.movementY = Math.floor(touch.clientY - this.state.lastTouch.y);
        }
      }
      this.setState({
        lastTouch: newLastTouch
      });
    }
    return normalized;
  },

  // =============== Event handlers ==================
  /** Gets called by the `ResponsiveMixin` whenever the container size changes.
   *  Reload the image, updates the canvas sizes and stores references to them
  *   on the state. */
  onSizeChanged() {
    const canvas = React.findDOMNode(this.refs.canvas);
    const offscreenCanvasNode = React.findDOMNode(this.refs.offscreenCanvas);
    const canvasRect = canvas.getBoundingClientRect();
    let newState = {
      canvasPosition: {
        x: canvasRect.left,
        y: canvasRect.top
      },
      sourceImage: this.loadImage()
    };

    // Store references to both canvases so we don't have to go look for them
    // each time
    if (!this.state.canvasNode) {
      newState.canvasNode = canvas;
    }
    if (!this.state.offscreenCanvasNode) {
      newState.offscreenCanvasNode = offscreenCanvasNode;
    }

    // Set the state and draw the image afterwards
    this.setState(newState, () => {
      this.renderImage();
      this.requestRedraw();
    });
  },

  handlePress(e) {
    e = this.normalizeInputEvent(e);
    const dragMode = this.getDragMode(e);
    let newState = {
      dragMode: dragMode === "default" ? "se-resize" : dragMode
    };
    if (dragMode === "default") {
      newState.cropParams = {
        x: e.clientX - this.state.canvasPosition.x,
        y: e.clientY - this.state.canvasPosition.y,
        width: 1,
        height: 1
      };
    }
    this.setState(newState);
    document.addEventListener("mouseup", this.handleRelease);
    document.addEventListener("touchend", this.handleRelease);
  },

  handleMovement(e) {
    e = this.normalizeInputEvent(e);
    if (!this.state.canvasNode) {
      return;
    }
    if (this.state.dragMode) {
      this.updateCropBox(e.movementX, e.movementY);
    } else {
      const cursorStyle = this.getDragMode(e);
      if (this.state.cursorStyle !== cursorStyle) {
        this.setState({cursorStyle});
      }
    }
  },

  handleRelease(e) {
    e = this.normalizeInputEvent(e);
    this.setState({dragMode: null});
    document.removeEventListener("mouseup", this.handleRelease);
    document.removeEventListener("touchend", this.handleRelease);
  },

  render() {
    return (
      <div ref="cropContainer" className="crop-container">
        <canvas width={this.state.size.width} height={this.state.size.height}
                onMouseDown={this.handlePress} onTouchStart={this.handlePress}
                style={{cursor: this.state.cursorStyle}} ref="canvas"
                className="onscreen-canvas" />
        <canvas width={this.state.size.width} height={this.state.size.height}
                ref="offscreenCanvas" style={{display: "none"}} />
      </div>
    );
  }
});
