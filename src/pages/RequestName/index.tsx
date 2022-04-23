import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '@/contexts/UserContext';

export function RequestName(): JSX.Element {
  const navigate = useNavigate();
  const { handleSetName } = useUser();

  function handleLogin(event: FormEvent): void {
    event.preventDefault();

    const { name } = event.target as typeof event.target & {
      name: { value: string };
    };

    handleSetName(name.value);
    navigate('/');
  }

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label htmlFor="name">
          Name:
          <input name="name" id="name" placeholder="Insert your name" />
        </label>
      </div>

      <button type="submit">Login</button>
    </form>
  );
}
