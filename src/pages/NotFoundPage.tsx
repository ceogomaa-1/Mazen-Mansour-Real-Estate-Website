import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className='section'>
      <div className='container empty-state'>
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to='/' className='button button-primary'>
          Back Home
        </Link>
      </div>
    </section>
  );
}
