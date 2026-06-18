import { FormEvent, useEffect, useState } from 'react'
import './App.css'
import { Book, supabase } from './supabase'

type SearchQuery = {
  title: string
  author: string
  translator: string
  publisher: string
  publicationYear: string
  isbn: string
  series: string
}

const initialSearch: SearchQuery = {
  title: '',
  author: '',
  translator: '',
  publisher: '',
  publicationYear: '',
  isbn: '',
  series: '',
}

function normalize(value: string) {
  return value.trim()
}

function displayValue(value: string | number | null) {
  return value ?? '-'
}

function App() {
  const [titleQuery, setTitleQuery] = useState('')
  const [authorQuery, setAuthorQuery] = useState('')
  const [translatorQuery, setTranslatorQuery] = useState('')
  const [publisherQuery, setPublisherQuery] = useState('')
  const [publicationYearQuery, setPublicationYearQuery] = useState('')
  const [isbnQuery, setIsbnQuery] = useState('')
  const [seriesQuery, setSeriesQuery] = useState('')
  const [submittedSearch, setSubmittedSearch] =
    useState<SearchQuery>(initialSearch)
  const [books, setBooks] = useState<Book[]>([])
  const [totalBooks, setTotalBooks] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTotalBooks() {
      const { count, error } = await supabase
        .from('books')
        .select('id', { count: 'exact', head: true })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      setTotalBooks(count)
    }

    fetchTotalBooks()
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function fetchBooks() {
      setIsLoading(true)
      setErrorMessage(null)

      const title = normalize(submittedSearch.title)
      const author = normalize(submittedSearch.author)
      const translator = normalize(submittedSearch.translator)
      const publisher = normalize(submittedSearch.publisher)
      const publicationYear = normalize(submittedSearch.publicationYear)
      const isbn = normalize(submittedSearch.isbn)
      const series = normalize(submittedSearch.series)

      let query = supabase
        .from('books')
        .select(
          'id,title,author,translator,publisher,publication_year,isbn,series,created_at,updated_at',
        )
        .order('title', { ascending: true })
        .limit(50)

      if (title) {
        query = query.ilike('title', `%${title}%`)
      }

      if (author) {
        query = query.ilike('author', `%${author}%`)
      }

      if (translator) {
        query = query.ilike('translator', `%${translator}%`)
      }

      if (publisher) {
        query = query.ilike('publisher', `%${publisher}%`)
      }

      if (publicationYear) {
        query = query.eq('publication_year', Number(publicationYear))
      }

      if (isbn) {
        query = query.ilike('isbn', `%${isbn}%`)
      }

      if (series) {
        query = query.ilike('series', `%${series}%`)
      }

      const { data, error } = await query

      if (!isCurrent) {
        return
      }

      if (error) {
        setBooks([])
        setErrorMessage(error.message)
      } else {
        setBooks(data ?? [])
      }

      setIsLoading(false)
    }

    fetchBooks()

    return () => {
      isCurrent = false
    }
  }, [submittedSearch])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittedSearch({
      title: titleQuery,
      author: authorQuery,
      translator: translatorQuery,
      publisher: publisherQuery,
      publicationYear: publicationYearQuery,
      isbn: isbnQuery,
      series: seriesQuery,
    })
  }

  function handleReset() {
    setTitleQuery('')
    setAuthorQuery('')
    setTranslatorQuery('')
    setPublisherQuery('')
    setPublicationYearQuery('')
    setIsbnQuery('')
    setSeriesQuery('')
    setSubmittedSearch(initialSearch)
  }

  return (
    <main className="library-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">406 Private Library</p>
          <h1>蔵書検索</h1>
        </div>
        <dl className="collection-summary" aria-label="蔵書概要">
          <div>
            <dt>登録冊数</dt>
            <dd>{totalBooks ?? '-'}</dd>
          </div>
          <div>
            <dt>検索対象</dt>
            <dd>書名・著者名</dd>
          </div>
        </dl>
      </header>

      <section className="search-panel" aria-label="蔵書検索フォーム">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="basic-search-fields">
            <label>
              <span>書名</span>
              <input
                type="search"
                value={titleQuery}
                onChange={(event) => setTitleQuery(event.target.value)}
                placeholder="例: Algebraic Geometry"
              />
            </label>
            <label>
              <span>著者名</span>
              <input
                type="search"
                value={authorQuery}
                onChange={(event) => setAuthorQuery(event.target.value)}
                placeholder="例: Robin Hartshorn"
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="primary-button">
                検索
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={handleReset}
              >
                クリア
              </button>
            </div>
          </div>

          <details className="advanced-search">
            <summary>詳細な検索</summary>
            <div className="advanced-fields">
              <label>
                <span>出版社</span>
                <input
                  type="search"
                  value={publisherQuery}
                  onChange={(event) => setPublisherQuery(event.target.value)}
                  placeholder="例: Springer"
                />
              </label>
              <label>
                <span>訳者</span>
                <input
                  type="search"
                  value={translatorQuery}
                  onChange={(event) => setTranslatorQuery(event.target.value)}
                  placeholder="例: 山田"
                />
              </label>
              <label>
                <span>シリーズ</span>
                <input
                  type="search"
                  value={seriesQuery}
                  onChange={(event) => setSeriesQuery(event.target.value)}
                  placeholder="例: GTM52"
                />
              </label>
              <label>
                <span>ISBN</span>
                <input
                  type="search"
                  value={isbnQuery}
                  onChange={(event) => setIsbnQuery(event.target.value)}
                  placeholder="例: 9780387902449"
                />
              </label>
              <label>
                <span>刊行年</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={publicationYearQuery}
                  onChange={(event) =>
                    setPublicationYearQuery(event.target.value)
                  }
                  placeholder="例: 1977"
                />
              </label>
            </div>
          </details>
        </form>
      </section>

      <section className="results-section" aria-live="polite">
        <div className="results-header">
          <h2>検索結果</h2>
          <span>{isLoading ? '読み込み中' : `${books.length}件`}</span>
        </div>

        {errorMessage ? (
          <div className="empty-state error-state">
            <h3>データを取得できませんでした</h3>
            <p>{errorMessage}</p>
          </div>
        ) : isLoading ? (
          <div className="empty-state">
            <h3>読み込み中</h3>
            <p>Supabase から蔵書データを取得しています。</p>
          </div>
        ) : books.length > 0 ? (
          <div className="results-list">
            {books.map((book) => (
              <article className="book-item" key={book.id}>
                <div className="book-main">
                  <div>
                    <h3>{book.title}</h3>
                    <p>
                      {book.author}
                      {book.translator ? ` / 訳: ${book.translator}` : ''}
                    </p>
                  </div>
                </div>
                <dl className="book-meta">
                  <div>
                    <dt>出版社</dt>
                    <dd>{displayValue(book.publisher)}</dd>
                  </div>
                  <div>
                    <dt>刊行年</dt>
                    <dd>{displayValue(book.publication_year)}</dd>
                  </div>
                  <div>
                    <dt>シリーズ</dt>
                    <dd>{displayValue(book.series)}</dd>
                  </div>
                  <div>
                    <dt>ISBN</dt>
                    <dd>{displayValue(book.isbn)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>該当する蔵書がありません</h3>
            <p>書名または著者名の一部だけで検索してみてください。</p>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
