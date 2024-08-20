import { SVGAttributes } from "react";

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
      <path fill="white" d="M4.5,10l4-4-4-4-1,1,3,3-3,3Z"></path>
    </svg>
  );
};

export const IconLeft: React.FC<SVGAttributes<HTMLOrSVGElement>> = props => {
  return (
    <svg
      {...props}
      width={16}
      height={16}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
    >
      <title>icon - chevron - left</title>
      <path fill="white" d="M7.5,2l-4,4,4,4,1-1-3-3,3-3Z"></path>
    </svg>
  );
};
