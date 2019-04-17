class HomePage extends Component {
    model = '';

    constructor() {
        const template = `
        <div class='container' id='container'>
            <p id='first' click='hello()'>{{message}}</p>
            <button click='another()' class="btn btn-primary mb-2">Increase Test ages</button>
            <input class='form-control' keypress='change()' value='test'/>
            
            <div style="margin-top: 2%;" class="card">
                <table class="table">
                    <thead class="thead-inverse">
                        <tr>
                            <th>
                                Name
                            </th>
                            <th>
                                Ages
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr vdom-repeat="item in list">
                            <td>{{item.name}}</td>
                            <td>{{item.age}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>`;

        const model = {
            message: `Hello World!`,
            list: [{
                name: 'Test',
                age: 15
            }, {
                name: 'Otro',
                age: 18
            }, {
                name: 'More',
                age: 23
            }],
        };

        const styles = [{
                element: {
                    selector: '#first',
                    style: {
                        color: 'red',
                    },
                },
            },
            {
                element: {
                    selector: '#container',
                    style: {
                        marginTop: '2%',
                    },
                },
            }
        ];

        super(template, model, styles);

        this.model = model;

        this.hello = this.hello.bind(this);
        this.another = this.another.bind(this);
        this.change = this.change.bind(this);
    }

    hello() {
        this.model.message = 'pepe';
        alert('Hello World');
    }

    another() {
        this.model.list[0].age++;
    }

    change() {
        alert('Heeey i have changed');
    }
}