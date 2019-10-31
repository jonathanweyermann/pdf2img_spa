import BarLoader from 'react-spinners/BarLoader';
import React from 'react';

export default function Spinner(props) {
  return (
    <div>
      <BarLoader
        sizeUnit={"%"}
        heightUnit={"px"}
        widthUnit={"percent"}
        width={50}
        height={23}
        color={'#123abc'}
        loading={true}
      />
      <div className="move-up">Loading.. Please wait</div>
    </div>
  )
}
