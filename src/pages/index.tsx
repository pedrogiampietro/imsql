import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-monokai';

import DataTable from '../components/DataTable';

const SqlExecutor = () => {
	const [query, setQuery] = useState('');
	const [result, setResult] = useState(null);
	const [suggestions, setSuggestions] = useState([]);

	useEffect(() => {
		const fetchMetaData = async () => {
			try {
				// Substitua esta URL pelo endpoint da sua API que retorna metadados do banco de dados
				const response = await axios.get(
					'http://localhost:3000/api/db-metadata'
				);
				setSuggestions(response.data);
			} catch (error) {
				console.error('Error fetching database metadata:', error);
			}
		};

		fetchMetaData();
	}, []);

	const customCompleter = {
		getCompletions: function (editor, session, pos, prefix, callback) {
			callback(
				null,
				suggestions.map((s) => ({
					caption: s.name,
					value: s.name,
					meta: s.type,
				}))
			);
		},
	};

	useEffect(() => {
		ace.require('ace/ext/language_tools').addCompleter(customCompleter);
	}, [suggestions]);

	const handleQueryChange = (newValue) => {
		setQuery(newValue);
	};

	const executeQuery = async () => {
		try {
			const response = await axios.post(
				'http://localhost:3000/api/execute-sql',
				{ sql: query }
			);
			setResult(response.data);
		} catch (error) {
			console.error('Error executing query:', error);
			setResult({ error: 'Error executing query. See console for details.' });
		}
	};

	return (
		<div className='container mx-auto p-4'>
			<AceEditor
				mode='sql'
				theme='monokai'
				onChange={handleQueryChange}
				name='queryEditor'
				editorProps={{ $blockScrolling: true }}
				value={query}
				width='100%'
				setOptions={{
					enableBasicAutocompletion: true,
					enableLiveAutocompletion: true,
					enableSnippets: true,
				}}
			/>
			<button
				onClick={executeQuery}
				className='mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
			>
				Execute Query
			</button>
			{result && (
				<div className='mt-4'>
					{result.error ? (
						<pre className='text-red-500'>{result.error}</pre>
					) : (
						<DataTable metaData={result.metaData} rows={result.rows} />
					)}
				</div>
			)}
		</div>
	);
};

export default SqlExecutor;
