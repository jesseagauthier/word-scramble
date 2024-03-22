function shuffle(src) {
	const copy = [...src]
	for (let i = 0; i < copy.length; i++) {
		const j = Math.floor(Math.random() * (i + 1))
		;[copy[i], copy[j]] = [copy[j], copy[i]]
	}
	return typeof src === 'string' ? copy.join('') : copy
}

function App() {
	const [words, setWords] = React.useState([])
	const [currentWord, setCurrentWord] = React.useState('')
	const [points, setPoints] = React.useState(0)
	const [strikes, setStrikes] = React.useState(0)
	const [passes, setPasses] = React.useState(3)
	const [arrangedLetters, setArrangedLetters] = React.useState({
		letters: [],
		positions: [],
	})
	const [feedbackMessage, setFeedbackMessage] = React.useState('')

	const fetchWords = () => {
		fetch('https://random-word-api.herokuapp.com/word?length=5')
			.then((response) => response.json())
			.then((data) => {
				const shuffledWords = shuffle(data)
				setWords(shuffledWords)
				setCurrentWord(shuffle(shuffledWords[0]))
			})
			.catch((error) => {
				console.error('Error fetching words:', error)
				setFeedbackMessage('Failed to fetch new words, please try again later.')
			})
	}

	// Fetch words from the API
	React.useEffect(() => {
		fetchWords()
	}, [])

	React.useEffect(() => {
		if (words.length > 0) {
			setCurrentWord(shuffle(words[0]))
			setArrangedLetters({ letters: [], positions: [] })
		}
	}, [words])

	function handleDragStart(e, letter, index) {
		e.dataTransfer.setData('text/plain', letter)
		e.dataTransfer.setData('index', index)
	}

	function handleDrop(e) {
		e.preventDefault()
		const letter = e.dataTransfer.getData('text')
		const startIndex = parseInt(e.dataTransfer.getData('index'), 10)

		// Ensure the drop area is valid
		const dropArea = e.target.closest('.drop-area')
		if (!dropArea) {
			alert('Invalid drop zone')
			return
		}

		// Determine the drop position
		const dropAreaRect = dropArea.getBoundingClientRect()
		const x = e.clientX - dropAreaRect.left
		let dropIndex = arrangedLetters.letters.length // Default to adding to the end

		// Calculate the position to insert based on the drop location
		if (arrangedLetters.positions.length > 0) {
			dropIndex = Math.floor(
				x / (dropAreaRect.width / arrangedLetters.letters.length)
			)
			dropIndex = Math.min(dropIndex, arrangedLetters.letters.length)
		}

		// Prepare the new state
		let newLetters = [...arrangedLetters.letters]
		let newPositions = [...arrangedLetters.positions]

		// If moving a letter within the drop area, adjust the arrays accordingly
		if (startIndex >= 0 && startIndex < newLetters.length) {
			newLetters.splice(startIndex, 1)
			newPositions.splice(startIndex, 1)
		}

		// Insert the letter in the calculated position
		newLetters.splice(dropIndex, 0, letter)
		newPositions.splice(dropIndex, 0, dropIndex)

		// Update the state with the new arrangements
		setArrangedLetters({ letters: newLetters, positions: newPositions })
	}

	function handleDragOver(e) {
		e.preventDefault()
	}

	function submitWord() {
		const userWord = arrangedLetters.letters.join('')
		if (userWord === words[0]) {
			setFeedbackMessage('Correct! Great job!')
			setPoints(points + 1)
			fetchWords()
		} else {
			setFeedbackMessage('Oops! Try again!')
			setStrikes(strikes + 1)
		}
		setArrangedLetters({ letters: [], positions: [] })
	}

	function resetGame() {
		setPoints(0)
		setStrikes(0)
		setPasses(3)
		setArrangedLetters({ letters: [], positions: [] })
		setFeedbackMessage('')
		fetchWords()
	}
	return (
		<div
			className='flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 space-y-4'
			role='main'
		>
			<h2 className='text-2xl font-bold' id='gameTitle'>
				Scramble Game
			</h2>
			<div
				className='flex flex-wrap justify-center gap-2'
				aria-labelledby='gameTitle'
				aria-describedby='instructions'
			>
				<p id='instructions' className='sr-only'>
					Drag and drop the letters to arrange them into a correct word.
				</p>
				{currentWord.split('').map((letter, index) => (
					<div
						key={index}
						draggable='true'
						onDragStart={(e) => handleDragStart(e, letter)}
						className='w-12 h-12 flex items-center justify-center bg-white border border-gray-300 rounded shadow cursor-pointer select-none'
						aria-grabbed='false'
						role='gridcell'
						aria-label={`Letter ${letter}`}
					>
						{letter}
					</div>
				))}
			</div>
			<div
				className='drop-area  min-w-[200px] min-h-[50px] flex flex-wrap justify-center gap-2 border-2 border-dashed border-gray-400 p-4'
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				aria-dropeffect='move'
				role='grid'
				aria-label='Drop zone for arranging letters'
			>
				{arrangedLetters.letters.map((letter, index) => (
					<div
						key={index}
						draggable='true'
						onDragStart={(e) =>
							handleDragStart(e, letter, arrangedLetters.positions[index])
						}
						className='w-12 h-12 flex items-center justify-center bg-white border border-gray-300 rounded shadow capitalize cursor-pointer'
						role='gridcell'
					>
						{letter}
					</div>
				))}
			</div>
			{feedbackMessage && (
				<div
					className='p-4 max-w-md bg-blue-100 border border-blue-400 text-blue-700 rounded-lg shadow'
					role='alert'
				>
					<p>{feedbackMessage}</p>
				</div>
			)}
			<button
				onClick={submitWord}
				className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
				role='button'
			>
				Submit
			</button>
			<div role='status'>
				Points: {points} | Strikes: {strikes} | Passes: {passes}
			</div>
			<button
				onClick={resetGame}
				className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
				role='button'
			>
				Reset Game
			</button>
		</div>
	)
}

const rootElement = document.getElementById('root')
if (rootElement) {
	const root = ReactDOM.createRoot(rootElement)
	root.render(<App />)
}
