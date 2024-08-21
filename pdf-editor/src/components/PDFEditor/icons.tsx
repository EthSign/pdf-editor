import React, { SVGAttributes } from "react";

export const IconRight: React.FC<SVGAttributes<HTMLOrSVGElement>> = props => {
  return (
    <svg
      width={16}
      height={16}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      {...props}
    >
      <title>icon - chevron - right</title>
      <path fill="currentColor" d="M4.5,10l4-4-4-4-1,1,3,3-3,3Z"></path>
    </svg>
  );
};

export const IconLeft: React.FC<SVGAttributes<HTMLOrSVGElement>> = props => {
  return (
    <svg
      width={16}
      height={16}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      {...props}
    >
      <title>icon - chevron - left</title>
      <path fill="currentColor" d="M7.5,2l-4,4,4,4,1-1-3-3,3-3Z"></path>
    </svg>
  );
};

export const IconSearch: React.FC<SVGAttributes<HTMLOrSVGElement>> = props => {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <title>icon - header - search</title>
      <path
        fill="currentColor"
        d="M17.69,15.79a8.63,8.63,0,1,0-1.52,1.51l4.42,4.42a.42.42,0,0,0,.57,0l.94-.95a.39.39,0,0,0,0-.56Zm-5.28,1A6.42,6.42,0,1,1,17.19,12,6.43,6.43,0,0,1,12.41,16.8Z"
      ></path>
    </svg>
  );
};

export const IconClose: React.FC<SVGAttributes<HTMLOrSVGElement>> = props => {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <title>icon - close</title>
      <path
        fill="currentColor"
        d="M16.22,6.28,12,10.5,7.78,6.28a.4.4,0,0,0-.56,0l-.94.94a.4.4,0,0,0,0,.56L10.5,12,6.28,16.22a.4.4,0,0,0,0,.56l.94.94a.4.4,0,0,0,.56,0L12,13.5l4.22,4.22a.4.4,0,0,0,.56,0l.94-.94a.4.4,0,0,0,0-.56L13.5,12l4.22-4.22a.4.4,0,0,0,0-.56l-.94-.94A.4.4,0,0,0,16.22,6.28Z"
      ></path>
    </svg>
  );
};
