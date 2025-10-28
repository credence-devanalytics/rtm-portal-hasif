// This file has been replaced by the new TableauDashboard component
// Please use: import TableauDashboard from '@/components/TableauDashboard';

export default function DeprecatedTableauDashboard() {

  return (
    <div className="p-4 border-2 border-red-500 rounded-lg bg-red-50">
      <h3 className="text-red-800 font-bold mb-2">Deprecated Component</h3>
      <p className="text-red-700">
        This component has been replaced by the new TableauDashboard component.
        <br />
        Please use: <code>import TableauDashboard from &apos;@/components/TableauDashboard&apos;;</code>
      </p>
    </div>
  );
    if (current_user !== pk) {
        return render(request, 'page-404.html')

    } else {
        const users = User.objects.get(pk=pk)
        const userprof = userprofile.objects.get(user_id=request.user.pk)
        const user_acc_type = userprof.acc_type
        const tableauServer = process.env.TABLEAU_SERVER_URL + '/'
        var tableauUsername: string = request.user.username
        const accnumdetails = accnum_details.objects.filter(userDetails_email_contains=users.email)
        const user_type = users.is_superuser
        if (user_type){
            tableauUsername = 'admin'
            var tableaupackage = 'TA'
            var workbookView = 'OfficialAdmin3_0-TollfreeAnalyticsDashboard/CallSummary?:showAppBanner=false&:display_count=n&:showVizHome=n&:origin=viz_share_link&:embed=y'
        }
        else {
            tableauUsername = accnumdetails[0].acc_num
            var tableaupackage = accnumdetails[0].dashboard_package
            var workbookView = 'OfficialUser5_0_CR-TollfreeAnalyticsDashboard/Dashboard11?:showAppBanner=false&:display_count=n&:showVizHome=n&:origin=viz_share_link&:embed=y'
        }

        const wgserverURL = tableauServer + 'trusted/'
}

        // if status_code has the response code, text has the ticket string
        if (r.status_code === 200) {
            if (r.text != '-1') {
                var ticketID = r.text
                var statusTableau = "SSO"
            }
            else {
                var ticketID = r.text
                var statusTableau = r.text
            }
        }
        else {
            console.log('Could not get trusted ticket with status code', r.status_code.toString())
        }

        const url = wgserverURL + ticketID + '/views/' + workbookView // final URL
        const context={'users':users, 'user_acc_type':user_acc_type, 'tableauUsername':tableauUsername, 'accnumdetails':accnumdetails,'tableauURL':url, 'statusTableau':statusTableau, 'ticketID':ticketID, 'tableauServer':wgserverURL, 'tableaupackage':tableaupackage }

        return render(request, "dashboard_new2.html", context)
    }
}