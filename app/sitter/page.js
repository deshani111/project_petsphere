import styles from './page.module.css'

const Icon = ({children}) => <span style={{width:20,height:20,display:'inline-grid',placeItems:'center'}}>{children}</span>

const StatCard = ({label, value, meta}) => (
  <article className={styles.statCard}>
    <div>{label}</div>
    <strong>{value}</strong>
    <small>{meta}</small>
  </article>
)

export default function SitterDashboard(){
  const statCards = [
    {label:"This Month's Earnings", value:"LKR 1,240.00", meta:"+12%"},
    {label:"Upcoming Bookings", value:"8 Confirmed", meta:"Next: Bruno"},
    {label:"Average Rating", value:"4.9 Stars", meta:"From 128 reviews"},
    {label:"Active Services", value:"3 Listed", meta:"Walking, Boarding, Sitting"},
  ]

  const requests = [
    {name:'Bruno', pet:'Boxer', owner:'Mark Davis', service:'Dog Walking', dates:'Oct 24 - Oct 26', status:'Pending'},
    {name:'Luna', pet:'Samoyed', owner:'Elena Rodriguez', service:'Pet Sitting', dates:'Oct 28 - Oct 30', status:'Pending'},
  ]

  const bookings = [
    {pet:'Buddy', owner:'Alice Thompson', service:'Dog Walking', date:'Oct 25, 2023', time:'09:00 AM', status:'Confirmed'},
    {pet:'Shadow', owner:'James Wilson', service:'Pet Boarding', date:'Oct 26, 2023', time:'Check-in 2:00 PM', status:'Confirmed'},
  ]

  return (
    <div className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.eyebrow}>Sitter Dashboard</div>
            <h1 className={styles.welcome}>Welcome back Sarah!</h1>
            <div style={{marginTop:8}} className={styles.statusPill}>Verified Professional</div>
          </div>
          <div>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <button style={{border:'1px solid #eadcd4',borderRadius:10,padding:8}}>🔔</button>
              <div style={{display:'flex',alignItems:'center',gap:10}}> <div style={{width:36,height:36,borderRadius:18,background:'#c87161',color:'#fff',display:'grid',placeItems:'center'}}>SJ</div> <div>Sarah Jenkins</div></div>
            </div>
          </div>
        </header>

        <section className={styles.statsGrid}>
          {statCards.map(s => <StatCard key={s.label} {...s} />)}
        </section>

        <section className={styles.contentGrid}>
          <div className="">
            <div className={styles.panel}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div>
                  <div style={{color:'#796a66',fontWeight:700}}>Pending Requests</div>
                  <h2 style={{margin:0}}>2</h2>
                </div>
                <a href="#">View All</a>
              </div>

              <div style={{display:'grid',gap:12}}>
                {requests.map(r => (
                  <div className={styles.requestCard} key={r.name}>
                    <div className={styles.requestTop}>
                      <div className={styles.requestAvatar}>{r.name.slice(0,1)}</div>
                      <div>
                        <strong>{r.name} ({r.pet})</strong>
                        <div style={{color:'#796a66'}}>Owner: {r.owner}</div>
                      </div>
                      <div style={{marginLeft:'auto',background:'#f3b24c',padding:'6px 8px',borderRadius:8,color:'#fff'}}>{r.status}</div>
                    </div>
                    <div style={{marginTop:10,display:'flex',justifyContent:'space-between',color:'#544543',fontWeight:700}}>
                      <span>{r.service}</span>
                      <span>{r.dates}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.panel} style={{marginTop:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{color:'#796a66',fontWeight:700}}>Upcoming Confirmed Bookings</div>
                  <h2 style={{margin:0}}>Schedule</h2>
                </div>
                <button className="">☰</button>
              </div>

              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Pet & Owner</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.pet+b.date}>
                        <td>
                          <div style={{display:'flex',gap:10,alignItems:'center'}}>
                            <img src="/hero-petsphere.svg" alt="" style={{width:44,height:44,borderRadius:8}} />
                            <div>
                              <div style={{fontWeight:700}}>{b.pet}</div>
                              <small style={{color:'#796a66'}}>Owner: {b.owner}</small>
                            </div>
                          </div>
                        </td>
                        <td>{b.service}</td>
                        <td>{b.date}</td>
                        <td>{b.time}</td>
                        <td><span style={{background:'#e6f7ee',color:'#216f48',padding:'6px 8px',borderRadius:8,fontWeight:700}}>{b.status}</span></td>
                        <td>⋮</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className={styles.panel} style={{height:'fit-content'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div>
                <div style={{color:'#796a66',fontWeight:700}}>Quick Actions</div>
                <h3 style={{margin:0}}>Tools</h3>
              </div>
            </div>

            <div style={{display:'grid',gap:10}}>
              <a className={styles.requestCard} href="#">Messages<p style={{margin:0,color:'#796a66'}}>3 unread chats</p></a>
              <a className={styles.requestCard} href="#">Manage Services<p style={{margin:0,color:'#796a66'}}>Update your offerings</p></a>
              <a className={styles.requestCard} href="#">My Profile<p style={{margin:0,color:'#796a66'}}>Keep your info current</p></a>
            </div>
          </aside>
        </section>
      </div>
  )
}
