import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export function EnterInMatch(): JSX.Element {
  const navigate = useNavigate();

  function handleLogin(event: FormEvent): void {
    event.preventDefault();

    const { id } = event.target as typeof event.target & {
      id: { value: string };
    };

    navigate(`/match/${id.value}`);
  }

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label htmlFor="id">
          Match id:
          <input name="id" id="id" placeholder="Id of match" />
        </label>
      </div>

      <button type="submit">Enter</button>
    </form>
  );
}
