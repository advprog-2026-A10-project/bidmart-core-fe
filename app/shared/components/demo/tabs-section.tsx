import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/shared/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/ui/card";
import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";
import { Button } from "~/shared/components/ui/button";

export function TabsSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Tabs</h2>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Default variant</p>
        <Tabs defaultValue="account" className="max-w-sm">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="tab-name">Name</Label>
                  <Input id="tab-name" defaultValue="John Doe" />
                </div>
                <Button size="sm">Save changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="tab-current-pw">Current password</Label>
                  <Input id="tab-current-pw" type="password" />
                </div>
                <Button size="sm">Change password</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Line variant</p>
        <Tabs defaultValue="overview">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications" disabled>
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p className="text-muted-foreground mt-2 text-sm">Overview content goes here.</p>
          </TabsContent>
          <TabsContent value="analytics">
            <p className="text-muted-foreground mt-2 text-sm">Analytics content goes here.</p>
          </TabsContent>
          <TabsContent value="reports">
            <p className="text-muted-foreground mt-2 text-sm">Reports content goes here.</p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Vertical orientation</p>
        <Tabs defaultValue="tab1" orientation="vertical" className="max-w-sm">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="text-muted-foreground text-sm">Content for tab 1.</p>
          </TabsContent>
          <TabsContent value="tab2">
            <p className="text-muted-foreground text-sm">Content for tab 2.</p>
          </TabsContent>
          <TabsContent value="tab3">
            <p className="text-muted-foreground text-sm">Content for tab 3.</p>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
