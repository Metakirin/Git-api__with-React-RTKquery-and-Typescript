import React, { useEffect, useState } from 'react'
import { RepoCard } from '../components/RepoCard'
import { useDebounce } from '../hooks/debounce'
import {
  useLazyGetUserReposQuery,
  useSearchUsersQuery
} from '../store/github/github.api'

export const HomePage = () => {
  const [search, setSearch] = useState<string>('')
  const [dropDown, setDropDown] = useState<boolean>(false)

  const debounced = useDebounce(search)
  const { isLoading, isError, data } = useSearchUsersQuery(debounced, {
    skip: debounced.length < 3,
    refetchOnFocus: true
  })

  const [fetchRepos, { isLoading: areReposLoading, data: repos }] =
    useLazyGetUserReposQuery()

  useEffect(() => {
    setDropDown(debounced.length >= 3 && data?.length! > 0)
  }, [debounced, data])

  const clickHandler = (username: string) => {
    fetchRepos(username)
    setDropDown(false)
  }

  return (
    <div className='flex justify-center pt-10 mx-auto h-screen w-screen'>
      {isError && (
        <p className='text-center text-red-600'>Something went wrong</p>
      )}

      <div className='relative w-[560px]'>
        <input
          type='text'
          className='border py-2 px-4 w-full h-[40] mb-2'
          placeholder='Search for usernamee'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {dropDown && (
          <ul className='list-none absolute top-[45px] left-0 right-0 max-h-[200px] shadow-md bg-white overflow-y-scroll'>
            {isLoading && <p className='text-center'>Loading...</p>}
            {data?.map((u) => (
              <li
                key={u.id}
                onClick={() => clickHandler(u.login)}
                className='py-2 px-4 hover:bg-gray-500 hover:text-white transition-colors cursor-pointer'
              >
                {u.login}
              </li>
            ))}
          </ul>
        )}

        <div className='container'>
          {areReposLoading && (
            <p className='text-center'>Repos are loading...</p>
          )}
          {repos?.map((repo) => (
            <RepoCard repo={repo} key={repo.id} />
          ))}
        </div>
      </div>
    </div>
  )
}
