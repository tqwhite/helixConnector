#!/usr/local/bin/node
'use strict';

const asynchronousPipePlus = new require('qtools-asynchronous-pipe-plus')();
const pipeRunner = asynchronousPipePlus.pipeRunner;
const taskListPlus = asynchronousPipePlus.taskListPlus; 

 const pipeFunction = (inData, callback) => {
	const taskList = new taskListPlus();
	
	taskList.push((args, next) => {
		const localCallback = (err, localResult1) => {
			if (err == 'someParticularError') {
				next('skipRestOfPipe', err);
				return;
			}
			console.dir({ 'only inboundData so far': args });
			
			args.localResult1 = localResult1;
			next(err, args);
		};
		localCallback('', 'localResult1_value');
	});
	
	
	taskList.push((args, next) => {
		const localCallback = (err, localResult3) => {
			args.localResult3 = localResult3;
			next(err, args);
		};
		console.dir({ 'shows localResult1 and inboundData': args });
		localCallback('', 'localResult3_value');
	});
	
	taskList.push(
		(args, next) => {
			const localCallback = (err, localResult2) => {
				args.localResult2 = localResult2;
				next(err, args);
			};
			console.dir({ 'shows localResult1 only': args });
			localCallback('', 'localResult2_value');
		},
		['localResult1']
	);
	
	taskList.push(taskList.restoreGlobalScope());
	
	taskList.push((args, next) => {
		const localCallback = (err, localResult3) => {
			args.localResult3 = localResult3;
			next(err, args);
		};
		console.dir({ 'shows all incoming values, 1, 2, hiding test': args });
		localCallback('', 'localResult3_value');
	});
	
	taskList.push(
		(args, next) => {
			const localCallback = (err, localResult4) => {
				args.localResult4 = localResult4;
				next(err, args);
			};
			console.dir({ 'shows localResult1 and inboundData': args });
			localCallback('', 'localResult2_value');
		},
		['localResult3', 'inboundData']
	);
	
	const initialData = typeof inData != 'undefined' ? inData : {};
	pipeRunner(taskList.getList(), initialData, (err, finalResult) => {
		console.dir({ 'final: shows localResult3, inboundData, and localResult4': finalResult });
		callback(err, finalResult);
	});
};

pipeFunction({ inboundData: 'inboundData_value' }, (err, result) => {
	console.log('if you do not see errors, it works');
});
