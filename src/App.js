import './App.css';

import LoginPage from "./components/login/LoginPage"
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import HomePage from "./components/home-page/HomePage";
import CampaignPage from "./components/campaign-page/CampaignPage";
import CampaignLogTable from "./components/campaign-log-table/CampaignLogTable";
import EmailLogTable from "./components/email-log-table/EmailLogTable";

function App() {
        return (
            <div>
                <BrowserRouter>
                    <Switch>
                        <Route path="/" component={LoginPage} exact/>
                        <Route exact path="/HomePage"><HomePage/></Route>
                        <Route path="/campaignPage/:templateName" render={(props) => (<CampaignPage {...props}/>)}>
                        </Route>
                        <Route path="/CampaignLogTable/:templateName" render={(props) => (<CampaignLogTable {...props}/>)}>
                        </Route>
                        <Route path="/EmailLogTable/:templateName/:campaignId" render={(props) => (<EmailLogTable {...props}/>)}>
                        </Route>
                    </Switch>
                </BrowserRouter>
            </div>
        );
}

export default App;


