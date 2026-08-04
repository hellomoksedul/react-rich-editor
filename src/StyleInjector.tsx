import React from 'react';
import { PACKAGE_STYLES } from './generated-styles';

export function StyleInjector() {
  return (
    <style
      id="hellokit-editor-styles"
      dangerouslySetInnerHTML={{ __html: PACKAGE_STYLES }}
    />
  );
}
