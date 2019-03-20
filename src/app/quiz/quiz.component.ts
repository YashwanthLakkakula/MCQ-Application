import {Component, OnInit} from '@angular/core';
import {QuizService} from '../services/quiz.service';
import {Option, Question, Quiz} from '../models';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.less'],
  providers: [QuizService]
})
export class QuizComponent implements OnInit {
  quiz: Quiz = new Quiz(null);
  mode: string;
  timeLeft: number;
  interval;
  requiredMessage: boolean;
  submit: boolean;
  pieChartOptions = {
    responsive: true
  };
  pieChartLabels = ['Correct Answers', 'InCorrect Answers'];
  pieChartColor: any = [
    {
      backgroundColor: ['rgba(30, 169, 224, 0.8)',
        'rgba(255,165,0,0.9)'
      ]
    }
  ];
  pieChartData: any = [
    {
      data: []
    }
  ];
  pager = {
    index: 0,
    size: 1,
    count: 1
  };

  constructor(private quizService: QuizService) {
  }

  ngOnInit() {
    this.timeLeft = 200;
    this.loadQuiz();
    this.submit = false;
  }

  loadQuiz() {
    this.mode = 'quiz';
    this.quizService.get('data/frontend.json').subscribe(res => {
      this.quiz = new Quiz(res);
      this.pager.count = this.quiz.questions.length;
      this.startTimer();
    });
  }


  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.onSubmit();
      }
    }, 1000);
  }


  get filteredQuestions() {
    return (this.quiz.questions) ?
      this.quiz.questions.slice(this.pager.index, this.pager.index + this.pager.size) : [];
  }

  onSelect(question: Question, option: Option) {
    if (question.questionTypeId === 1) {
      question.options.forEach((opt) => {
        if (opt.id !== option.id) {
          opt.selected = false;
        }
      });
    }
  }

  goTo(index: number) {
    if (index >= 0 && index < this.pager.count) {
      this.pager.index = index;
    }
    this.requiredMessage = this.submit && !this.quiz.questions[index].options.find(option => option.selected);
  }

  onSubmit() {
    const answeredQuestions = [];
    const unAnsweredQuestions = [];
    const correctAnswers = [];
    const inCorrectAnswers = [];
    this.quiz.questions.forEach(question => {
      const evaluateAnswer = question.options.every(option => option.selected === option.isAnswer);
      const optionSelected = question.options.find(option => option.selected);
      if (evaluateAnswer) {
        correctAnswers.push(question);
      } else {
        inCorrectAnswers.push(question);
      }
      if (optionSelected) {
        answeredQuestions.push(question);
      } else {
        unAnsweredQuestions.push(question);
      }
    });
    if (!unAnsweredQuestions.length || !this.timeLeft) {
      this.mode = 'result';
      this.pieChartData = [{data: [correctAnswers.length, inCorrectAnswers.length]}] as any [];
    } else {
      this.submit = true;
      this.goTo(this.quiz.questions.indexOf(unAnsweredQuestions[0]));
    }

  }

}
