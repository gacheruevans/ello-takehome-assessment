import React, { useEffect, useState } from 'react'
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

import { v4 as uuidv4 } from 'uuid';

import {useQuery} from '@apollo/client';
import {LOAD_BOOKS} from '../GraphQl/Queries';

import BooksGrid from './BooksGrid';
import Typography from '@mui/material/Typography';

interface Book {
  id: string;
  title: string;
  author: string;
  readingLevel: string;
}

const SearchBar: React.FC = () => {
  const [focus, setFocus] = useState<number>(500);
  const [filteredData, setFilteredData] = useState([]);
  const { loading, error, data } = useQuery<{ books: Book[] }>(LOAD_BOOKS);
  const [books, setBooks] = useState<Book[]>([]);
  const [trigger, setTrigger] = useState(false);

  const options = books.map((option) => {
    const firstLetter = option.readingLevel.toUpperCase();
    return {
      firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
      ...option,
    };
  });

  const handleFilter = (e) => {
    const searchWord = e.target.value;
    
    if(e.key === 'Enter') {
      e.preventDefault();
      if(searchWord === '') setFilteredData([]);
    }
    
    const newFilter = books.filter((book) => 
      book.title.toLowerCase().includes(searchWord.toLowerCase())
    );
    setFilteredData(newFilter);
  };

  useEffect(() => {

    if(data) {
      setBooks(data.books);
    }
  }, [data]);

  return (
    <>
      <div className='search_component'>
        <Autocomplete
          id="book-search"
          options={options.sort((a, b) => -b.firstLetter.localeCompare(a.firstLetter))}
          autoHighlight
          noOptionsText={ error ? 'No options' : 'search for something else'}
          groupBy={(option) => option.readingLevel}
          getOptionLabel={(option) => option.title}
          sx={{ width:`${focus}px`, border: 'none'}}
          renderOption={(props, option) => (
            <Box 
              key={uuidv4()+ option.id} 
              component="li" 
              sx={{ '& > img': { mr: 1, flexShrink: 0 }}} 
              {...props}>
              <img  
                loading="lazy"
                width="60"
                srcSet={`${option.coverPhotoURL}`}
                src={`${option.coverPhotoURL}`}
                alt=""
              />
              {option.title}
              <Divider sx={{ height: 28, m: 0.5 }} orientation="horizontal" />
            </Box>
          )}
          renderInput={(params) => (
            <>
              <Paper
                component="form"
                sx={{ p: '6px 14px', display: 'flex', alignItems: 'center', border: '2px solid #5ACCCC'}}
              >
                <TextField
                  {...params}
                  label="What are we reading today?"
                  InputProps={{
                    ...params.InputProps,
                    type: 'search',
                  }}
                  variant="standard"
                  onChange={handleFilter}
                  onKeyDown={handleFilter}
                  onFocus={handleFilter}
                />
                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                  <SearchIcon sx={{ color: '#FAAD00' }}/>
                </IconButton>
              </Paper>
            </>
          )}
        />
      </div>
      <div className="books_component">
        {
          error ? 
          (
            <div className='error_div'>
              <Typography variant="h6" sx={{color:'#F76434'}} component="h2">
                Internal Server Error: {error.message} books data ensure backend server is up
              </Typography>
            </div>
          ) :
          !loading && ( <BooksGrid filteredData={filteredData} unfilteredData={books}/> )
        }
      </div>
    </>
  )
}

export default SearchBar
