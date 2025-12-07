import dotenv from 'dotenv';
import { fetchAndStoreMovies } from '../movieService.js';

// Load environment variables
dotenv.config();

// Get append flag from command line arguments
const append = process.argv.includes('--append') || process.argv.includes('-a');

async function main() {
  try {
    console.log('Starting movie fetch...');
    console.log(`Mode: ${append ? 'Append (add new movies)' : 'Replace (create new file)'}\n`);
    
    const results = await fetchAndStoreMovies(append);
    
    console.log('\n✅ Movie fetch completed!');
    console.log(`Successfully fetched: ${results.success} movies`);
    if (results.failed > 0) {
      console.log(`Failed: ${results.failed} movies`);
    }
    console.log(`Total movies in file: ${results.movies.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error fetching movies:', error.message);
    process.exit(1);
  }
}

main();

