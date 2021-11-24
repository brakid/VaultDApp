import React from 'react';
import { useParams } from 'react-router';

const Vault = () => {
  const { id } = useParams<string>();

  return (
    <div>
      Vault { JSON.stringify(id) }
    </div>
  );
}

export default Vault;