import chroma from 'chroma-js';

// Nodes and link base colors
export const PURPLE = '#b41f77';
export const BLUE =   '#1f77b4';
export const GREEN =  '#77b41f';

// Selection
export const ORANGE = '#ff8800';

export const NODE_COLORS = {

  FOLDER: PURPLE,

  IMAGE: BLUE,

  ENTITY_TYPE: GREEN

} 

export const LINK_COLORS = {

  DEFAULT: '#d9d9d9',

  FOLDER_CONTAINS_SUBFOLDER: chroma(PURPLE).desaturate(2).alpha(0.8).hex(),

  FOLDER_CONTAINS_IMAGE: chroma(PURPLE).desaturate(2).alpha(0.8).hex(),

  IS_PARENT_TYPE_OF: chroma(GREEN).desaturate(2).alpha(0.8).hex(),

  HAS_ENTITY_ANNOTATION: chroma(BLUE).desaturate().alpha(0.8).hex(),

  HAS_RELATED_ANNOTATION_IN: ORANGE,

  IS_RELATED_VIA_ANNOTATION: ORANGE

}

export const LINK_STYLES = {

  FOLDER_CONTAINS_SUBFOLDER: [4, 3],

  FOLDER_CONTAINS_IMAGE: [4, 3],

  IS_PARENT_TYPE_OF: [4, 3],

}

